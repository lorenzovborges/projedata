import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CompositionDialog } from '../products/CompositionDialog';
import { renderWithProviders } from '../../test/testUtils';
import { httpClient } from '../../api/httpClient';
import { buildAxiosResponse } from '../../test/axiosTestUtils';

const mockProduct = { id: 1, code: 'PRD-1', name: 'Produto Teste', value: 100 };

describe('CompositionDialog', () => {
  beforeEach(() => {
    vi.spyOn(httpClient, 'get').mockResolvedValue(buildAxiosResponse([]));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders dialog when product is provided', async () => {
    renderWithProviders(
      <CompositionDialog product={mockProduct} onClose={vi.fn()} />,
      {
        preloadedState: {
          rawMaterials: { items: [], loading: false, error: null },
        },
      }
    );

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Composição: Produto Teste')).toBeInTheDocument();
  });

  it('does not render dialog when product is null', () => {
    renderWithProviders(
      <CompositionDialog product={null} onClose={vi.fn()} />,
      {
        preloadedState: {
          rawMaterials: { items: [], loading: false, error: null },
        },
      }
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    renderWithProviders(
      <CompositionDialog product={mockProduct} onClose={onClose} />,
      {
        preloadedState: {
          rawMaterials: { items: [], loading: false, error: null },
        },
      }
    );

    await screen.findByRole('dialog');

    const closeButton = screen.getByRole('button', { name: 'Fechar' });
    await userEvent.setup().click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape is pressed', async () => {
    const onClose = vi.fn();
    renderWithProviders(
      <CompositionDialog product={mockProduct} onClose={onClose} />,
      {
        preloadedState: {
          rawMaterials: { items: [], loading: false, error: null },
        },
      }
    );

    await screen.findByRole('dialog');

    await userEvent.setup().keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });
});
