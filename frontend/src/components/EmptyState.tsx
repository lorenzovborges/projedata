import { Inbox } from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';

interface EmptyStateProps {
  colSpan: number;
  message?: string;
}

export function EmptyState({ colSpan, message = 'Nenhum registro encontrado.' }: EmptyStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Inbox className="h-8 w-8" />
          <span className="text-sm">{message}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
