import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { RawMaterialsPage } from './RawMaterialsPage';
import { httpClient } from '../api/httpClient';
import { renderWithProviders } from '../test/testUtils';
import { buildAxiosResponse } from '../test/axiosTestUtils';

describe('RawMaterialsPage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows validation error on empty submit', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue(buildAxiosResponse([]));

    renderWithProviders(<RawMaterialsPage />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /nova matéria-prima/i }));

    const dialog = await screen.findByRole('dialog');
    const dialogScope = within(dialog);

    fireEvent.submit(dialogScope.getByText('Salvar matéria-prima').closest('form')!);

    expect(
      await screen.findByText('Preencha código e nome da matéria-prima.')
    ).toBeInTheDocument();
  });

  it('renders fetched raw materials in table', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue(
      buildAxiosResponse([
        { id: 1, code: 'RM-1', name: 'Aço', stockQuantity: 10 },
      ])
    );

    renderWithProviders(<RawMaterialsPage />);

    expect(await screen.findByText('Aço')).toBeInTheDocument();
    expect(screen.getByText('RM-1')).toBeInTheDocument();
    expect(screen.getByText('10.000')).toBeInTheDocument();
  });

  it('submits form and shows success toast', async () => {
    const created = { id: 1, code: 'RM-NEW', name: 'Cobre', stockQuantity: 5 };
    let wasCreated = false;

    vi.spyOn(httpClient, 'get').mockImplementation(async () => {
      return buildAxiosResponse(wasCreated ? [created] : []);
    });

    const postMock = vi.spyOn(httpClient, 'post').mockImplementation(async () => {
      wasCreated = true;
      return buildAxiosResponse(created, 201, 'Created');
    });

    renderWithProviders(<RawMaterialsPage />);

    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /nova matéria-prima/i }));

    const dialog = await screen.findByRole('dialog');
    const dialogScope = within(dialog);

    await user.type(dialogScope.getByLabelText('Código'), 'RM-NEW');
    await user.type(dialogScope.getByLabelText('Nome'), 'Cobre');
    await user.type(dialogScope.getByLabelText('Quantidade em estoque'), '5');

    fireEvent.submit(dialogScope.getByText('Salvar matéria-prima').closest('form')!);

    await waitFor(() => {
      expect(postMock).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText('Cobre')).toBeInTheDocument();
  });

  it('opens ConfirmDialog when deleting', async () => {
    vi.spyOn(httpClient, 'get').mockResolvedValue(
      buildAxiosResponse([
        { id: 1, code: 'RM-1', name: 'Aço', stockQuantity: 10 },
      ])
    );

    renderWithProviders(<RawMaterialsPage />);

    await screen.findByText('Aço');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Excluir' }));

    expect(await screen.findByText('Excluir matéria-prima')).toBeInTheDocument();
  });
});
