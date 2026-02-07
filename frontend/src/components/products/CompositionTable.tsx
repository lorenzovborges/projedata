import { Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { ProductMaterial } from '@/types';

interface CompositionTableProps {
  items: ProductMaterial[];
  loading: boolean;
  onEdit: (item: ProductMaterial) => void;
  onDelete: (item: ProductMaterial) => void;
}

export function CompositionTable({ items, loading, onEdit, onDelete }: CompositionTableProps) {
  return (
    <DataTable
      columns={[
        { header: 'Matéria-prima' },
        { header: 'Qtd. necessária' },
        { header: 'Ações', className: 'w-[100px]' },
      ]}
      loading={loading}
      isEmpty={items.length === 0}
      emptyMessage="Nenhuma matéria-prima associada."
    >
      {items.map((item) => (
        <TableRow key={item.id}>
          <TableCell className="font-medium">
            {item.rawMaterialCode} - {item.rawMaterialName}
          </TableCell>
          <TableCell className="font-mono text-sm">{item.requiredQuantity.toFixed(3)}</TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(item)}>
                <Trash2 className="h-4 w-4 text-danger-600" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </DataTable>
  );
}
