import { ReactNode } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';

interface Column {
  header: string;
  className?: string;
}

interface DataTableProps {
  columns: Column[];
  loading?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

export function DataTable({ columns, loading, isEmpty, emptyMessage, children }: DataTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((col) => (
            <TableHead key={col.header} className={col.className}>
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <LoadingState colSpan={columns.length} />
        ) : isEmpty ? (
          <EmptyState colSpan={columns.length} message={emptyMessage} />
        ) : (
          children
        )}
      </TableBody>
    </Table>
  );
}
