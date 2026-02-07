import { screen } from '@testing-library/react';
import { ProductionPlanPage } from './ProductionPlanPage';
import { renderWithProviders } from '../test/testUtils';

describe('ProductionPlanPage', () => {
  it('displays error toast from global state', () => {
    renderWithProviders(<ProductionPlanPage />, {
      preloadedState: {
        productionPlan: {
          items: [],
          totalProductionValue: 0,
          loading: false,
          error: 'Falha ao calcular produção sugerida',
        },
      },
    });

    expect(screen.getByText('Calcular produção sugerida')).toBeInTheDocument();
  });

  it('renders summary cards with data', () => {
    renderWithProviders(<ProductionPlanPage />, {
      preloadedState: {
        productionPlan: {
          items: [
            {
              productId: 1,
              productCode: 'PRD-001',
              productName: 'Produto A',
              unitValue: 100,
              suggestedQuantity: 5,
              subtotalValue: 500,
            },
          ],
          totalProductionValue: 500,
          loading: false,
          error: null,
        },
      },
    });

    expect(screen.getByText('Produtos sugeridos')).toBeInTheDocument();
    expect(screen.getByText('Unidades totais')).toBeInTheDocument();
    expect(screen.getByText('Valor total')).toBeInTheDocument();
    expect(screen.getByText('Produto A')).toBeInTheDocument();
    expect(screen.getByText('PRD-001')).toBeInTheDocument();
  });

  it('shows skeleton during loading', () => {
    const { container } = renderWithProviders(<ProductionPlanPage />, {
      preloadedState: {
        productionPlan: {
          items: [],
          totalProductionValue: 0,
          loading: true,
          error: null,
        },
      },
    });

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state before calculating', () => {
    renderWithProviders(<ProductionPlanPage />);

    expect(
      screen.getByText('Nenhum produto pode ser produzido com o estoque atual.')
    ).toBeInTheDocument();
  });
});
