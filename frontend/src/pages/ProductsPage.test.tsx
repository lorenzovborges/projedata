import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ProductsPage } from './ProductsPage';
import { httpClient } from '../api/httpClient';
import { renderWithProviders } from '../test/testUtils';
import { buildAxiosResponse } from '../test/axiosTestUtils';

describe('ProductsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders fetched products in table', async () => {
    vi.spyOn(httpClient, 'get').mockImplementation(async (url) => {
      if (url === '/products') {
        return buildAxiosResponse([
          { id: 1, code: 'PRD-1', name: 'Produto Teste', value: 10.5 },
        ]);
      }
      if (url === '/raw-materials') {
        return buildAxiosResponse([]);
      }
      return buildAxiosResponse([]);
    });

    renderWithProviders(<ProductsPage />);

    expect(await screen.findByText('Produto Teste')).toBeInTheDocument();
    expect(screen.getByText('PRD-1')).toBeInTheDocument();
  });

  it('submits product form and displays the created item', async () => {
    let wasCreated = false;
    const createdProduct = { id: 9, code: 'PRD-NEW', name: 'Produto Novo', value: 77.9 };

    const getMock = vi.spyOn(httpClient, 'get').mockImplementation(async (url) => {
      if (url === '/products') {
        return buildAxiosResponse(wasCreated ? [createdProduct] : []);
      }
      if (url === '/raw-materials') {
        return buildAxiosResponse([]);
      }
      return buildAxiosResponse([]);
    });

    const postMock = vi.spyOn(httpClient, 'post').mockImplementation(async () => {
      wasCreated = true;
      return buildAxiosResponse(createdProduct, 201, 'Created');
    });

    renderWithProviders(<ProductsPage />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /novo produto/i }));

    const dialog = await screen.findByRole('dialog');
    const dialogScope = within(dialog);

    await user.type(dialogScope.getByLabelText('Código'), 'PRD-NEW');
    await user.type(dialogScope.getByLabelText('Nome'), 'Produto Novo');
    await user.type(dialogScope.getByLabelText('Valor'), '77.90');

    fireEvent.submit(dialogScope.getByText('Salvar produto').closest('form')!);

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(getMock).toHaveBeenCalled();
    });

    expect(await screen.findByText('Produto Novo')).toBeInTheDocument();
  });

  it('shows validation error on empty submit', async () => {
    vi.spyOn(httpClient, 'get').mockImplementation(async (url) => {
      if (url === '/products') return buildAxiosResponse([]);
      if (url === '/raw-materials') return buildAxiosResponse([]);
      return buildAxiosResponse([]);
    });

    renderWithProviders(<ProductsPage />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /novo produto/i }));

    const dialog = await screen.findByRole('dialog');
    const dialogScope = within(dialog);

    fireEvent.submit(dialogScope.getByText('Salvar produto').closest('form')!);

    expect(await screen.findByText('Preencha código e nome do produto.')).toBeInTheDocument();
  });

  it('opens CompositionDialog when clicking composition button', async () => {
    vi.spyOn(httpClient, 'get').mockImplementation(async (url) => {
      if (url === '/products') {
        return buildAxiosResponse([
          { id: 1, code: 'PRD-1', name: 'Produto Teste', value: 10.5 },
        ]);
      }
      if (url === '/raw-materials') {
        return buildAxiosResponse([{ id: 1, code: 'RM-1', name: 'Aço', stockQuantity: 10 }]);
      }
      return buildAxiosResponse([]);
    });

    renderWithProviders(<ProductsPage />);

    await screen.findByText('Produto Teste');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Composição' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Composição: Produto Teste')).toBeInTheDocument();
  });

  it('opens ConfirmDialog when deleting a product', async () => {
    vi.spyOn(httpClient, 'get').mockImplementation(async (url) => {
      if (url === '/products') {
        return buildAxiosResponse([
          { id: 1, code: 'PRD-1', name: 'Produto Teste', value: 10.5 },
        ]);
      }
      if (url === '/raw-materials') return buildAxiosResponse([]);
      return buildAxiosResponse([]);
    });

    renderWithProviders(<ProductsPage />);

    await screen.findByText('Produto Teste');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Excluir' }));

    expect(await screen.findByText('Excluir produto')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('populates form when editing a product', async () => {
    vi.spyOn(httpClient, 'get').mockImplementation(async (url) => {
      if (url === '/products') {
        return buildAxiosResponse([
          { id: 1, code: 'PRD-1', name: 'Produto Teste', value: 10.5 },
        ]);
      }
      if (url === '/raw-materials') return buildAxiosResponse([]);
      return buildAxiosResponse([]);
    });

    renderWithProviders(<ProductsPage />);

    await screen.findByText('Produto Teste');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Editar' }));

    const dialog = await screen.findByRole('dialog');
    const dialogScope = within(dialog);

    expect(dialogScope.getByText('Editar produto')).toBeInTheDocument();
    expect(dialogScope.getByLabelText('Código')).toHaveValue('PRD-1');
    expect(dialogScope.getByLabelText('Nome')).toHaveValue('Produto Teste');
  });
});
