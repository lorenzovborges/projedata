import { useEffect } from 'react';
import { toast } from 'sonner';
import { Package, Hash, DollarSign, Calculator } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProductionPlan } from '@/store/slices/productionPlanSlice';
import { currencyFormatter } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';

export function ProductionPlanPage() {
  const dispatch = useAppDispatch();
  const { items, totalProductionValue, loading, error } = useAppSelector(
    (state) => state.productionPlan
  );

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const totalUnits = items.reduce((sum, item) => sum + item.suggestedQuantity, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulação de produção"
        description="O cálculo prioriza produtos de maior valor e usa o estoque atual de matérias-primas sem realizar baixa real."
        actions={
          <Button
            onClick={() => void dispatch(fetchProductionPlan())}
            disabled={loading}
          >
            <Calculator className="h-4 w-4" />
            {loading ? 'Calculando...' : 'Calcular produção sugerida'}
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Produtos sugeridos</CardTitle>
            <Package className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{items.length}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Unidades totais</CardTitle>
            <Hash className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{totalUnits}</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary-200 bg-primary-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary-600">Valor total</CardTitle>
            <DollarSign className="h-4 w-4 text-primary-400" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold text-primary-700 font-mono">
                {currencyFormatter.format(totalProductionValue)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resultado da simulação</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { header: 'Código' },
              { header: 'Produto' },
              { header: 'Valor unitário' },
              { header: 'Qtd. sugerida' },
              { header: 'Subtotal' },
            ]}
            loading={loading}
            isEmpty={items.length === 0}
            emptyMessage="Nenhum produto pode ser produzido com o estoque atual."
          >
            {items.map((item) => (
              <TableRow key={item.productId}>
                <TableCell>
                  <Badge variant="secondary">{item.productCode}</Badge>
                </TableCell>
                <TableCell className="font-medium">{item.productName}</TableCell>
                <TableCell className="font-mono text-sm">
                  {currencyFormatter.format(item.unitValue)}
                </TableCell>
                <TableCell className="font-semibold">{item.suggestedQuantity}</TableCell>
                <TableCell className="font-mono text-sm">
                  {currencyFormatter.format(item.subtotalValue)}
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </CardContent>
      </Card>
    </div>
  );
}
