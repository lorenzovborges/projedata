import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  createProductMaterial,
  deleteProductMaterial,
  fetchProductMaterials,
  updateProductMaterial,
} from '@/store/slices/productMaterialsSlice';
import { Product, ProductMaterial } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { CompositionForm } from './CompositionForm';
import { CompositionTable } from './CompositionTable';

interface CompositionDialogProps {
  product: Product | null;
  onClose: () => void;
}

export function CompositionDialog({ product, onClose }: CompositionDialogProps) {
  const dispatch = useAppDispatch();
  const rawMaterialsState = useAppSelector((state) => state.rawMaterials);
  const productMaterialsState = useAppSelector((state) => state.productMaterials);

  const [editingCompositionId, setEditingCompositionId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductMaterial | null>(null);

  const materials = product ? productMaterialsState.itemsByProduct[product.id] ?? [] : [];
  const editingComposition =
    editingCompositionId === null
      ? null
      : materials.find((item) => item.id === editingCompositionId) ?? null;

  useEffect(() => {
    if (product) {
      void dispatch(fetchProductMaterials(product.id));
    }
  }, [dispatch, product]);

  const handleSubmitComposition = async (rawMaterialId: number, requiredQuantity: number) => {
    if (!product) return;

    if (editingComposition) {
      await dispatch(
        updateProductMaterial({
          id: editingComposition.id,
          payload: { productId: product.id, rawMaterialId, requiredQuantity },
        })
      ).unwrap();
      toast.success('Composição atualizada com sucesso.');
    } else {
      await dispatch(
        createProductMaterial({ productId: product.id, rawMaterialId, requiredQuantity })
      ).unwrap();
      toast.success('Matéria-prima adicionada à composição.');
    }
    setEditingCompositionId(null);
  };

  const handleConfirmDelete = async () => {
    if (!product || !deleteTarget) return;
    try {
      await dispatch(
        deleteProductMaterial({ id: deleteTarget.id, productId: product.id })
      ).unwrap();
      toast.success('Matéria-prima removida da composição.');
    } catch {
      toast.error('Erro ao remover matéria-prima da composição.');
    }
    setDeleteTarget(null);
  };

  return (
    <>
      <Dialog
        open={product !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingCompositionId(null);
            setDeleteTarget(null);
            onClose();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Composição: {product?.name}</DialogTitle>
            <DialogDescription>
              Gerencie as matérias-primas necessárias para produzir este produto.
            </DialogDescription>
          </DialogHeader>

          <CompositionForm
            key={editingComposition?.id ?? 'new'}
            rawMaterials={rawMaterialsState.items}
            editingRawMaterialId={editingComposition ? String(editingComposition.rawMaterialId) : ''}
            editingQuantity={editingComposition ? String(editingComposition.requiredQuantity) : ''}
            loading={productMaterialsState.loading}
            isEditing={editingComposition !== null}
            onSubmit={handleSubmitComposition}
            onCancelEdit={() => setEditingCompositionId(null)}
          />

          <Separator />

          <CompositionTable
            items={materials}
            loading={productMaterialsState.loading}
            onEdit={(item) => setEditingCompositionId(item.id)}
            onDelete={setDeleteTarget}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remover matéria-prima"
        description="Deseja remover esta matéria-prima da composição?"
        confirmLabel="Remover"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
