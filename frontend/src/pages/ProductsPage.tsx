import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, ListTree, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearProductsError,
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '@/store/slices/productsSlice';
import { fetchRawMaterials } from '@/store/slices/rawMaterialsSlice';
import { Product } from '@/types';
import { currencyFormatter } from '@/lib/utils';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FormDialog } from '@/components/FormDialog';
import { ProductForm } from '@/components/products/ProductForm';
import { CompositionDialog } from '@/components/products/CompositionDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';

export function ProductsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.products);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [compositionProduct, setCompositionProduct] = useState<Product | null>(null);

  useEffect(() => {
    void dispatch(fetchProducts());
    void dispatch(fetchRawMaterials());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearProductsError());
    }
  }, [error, dispatch]);

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingItem(product);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (data: { code: string; name: string; value: number }) => {
    if (editingItem) {
      await dispatch(updateProduct({ id: editingItem.id, payload: data })).unwrap();
      toast.success('Produto atualizado com sucesso.');
    } else {
      await dispatch(createProduct(data)).unwrap();
      toast.success('Produto criado com sucesso.');
    }
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget === null) return;
    try {
      await dispatch(deleteProduct(deleteTarget)).unwrap();
      toast.success('Produto excluído com sucesso.');
      if (compositionProduct?.id === deleteTarget) {
        setCompositionProduct(null);
      }
    } catch {
      toast.error('Erro ao excluir produto.');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produtos"
        description="Gerencie os produtos e suas composições de matérias-primas."
        actions={
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-2" />
            Novo produto
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { header: 'Código' },
              { header: 'Nome' },
              { header: 'Valor' },
              { header: 'Ações', className: 'w-[160px]' },
            ]}
            loading={loading}
            isEmpty={items.length === 0}
            emptyMessage="Nenhum produto cadastrado."
          >
            {items.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <Badge>{product.code}</Badge>
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="font-mono text-sm">
                  {currencyFormatter.format(product.value)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => handleOpenEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Composição"
                      onClick={() => setCompositionProduct(product)}
                    >
                      <ListTree className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => setDeleteTarget(product.id)}>
                      <Trash2 className="h-4 w-4 text-danger-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        </CardContent>
      </Card>

      <FormDialog
        open={formOpen}
        onClose={handleCloseForm}
        title={editingItem ? 'Editar produto' : 'Novo produto'}
        description={editingItem ? 'Altere os dados do produto.' : 'Preencha os dados do novo produto.'}
      >
        <ProductForm
          key={editingItem?.id ?? 'new'}
          editingItem={editingItem}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </FormDialog>

      <CompositionDialog
        product={compositionProduct}
        onClose={() => setCompositionProduct(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
