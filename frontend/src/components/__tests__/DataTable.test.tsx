import { render, screen } from '@testing-library/react';
import { DataTable } from '../DataTable';
import { TableCell, TableRow } from '../ui/table';

const columns = [
  { header: 'Nome' },
  { header: 'Valor' },
];

describe('DataTable', () => {
  it('renders column headers', () => {
    render(
      <DataTable columns={columns} isEmpty>
        <TableRow>
          <TableCell>test</TableCell>
        </TableRow>
      </DataTable>
    );

    expect(screen.getByText('Nome')).toBeInTheDocument();
    expect(screen.getByText('Valor')).toBeInTheDocument();
  });

  it('shows loading skeleton', () => {
    const { container } = render(
      <DataTable columns={columns} loading>
        <TableRow>
          <TableCell>test</TableCell>
        </TableRow>
      </DataTable>
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('shows empty state when no items', () => {
    render(
      <DataTable columns={columns} isEmpty emptyMessage="Sem dados">
        <TableRow>
          <TableCell>test</TableCell>
        </TableRow>
      </DataTable>
    );

    expect(screen.getByText('Sem dados')).toBeInTheDocument();
  });

  it('renders children when not empty and not loading', () => {
    render(
      <DataTable columns={columns}>
        <TableRow>
          <TableCell>Produto A</TableCell>
          <TableCell>R$ 100</TableCell>
        </TableRow>
      </DataTable>
    );

    expect(screen.getByText('Produto A')).toBeInTheDocument();
    expect(screen.getByText('R$ 100')).toBeInTheDocument();
  });
});
