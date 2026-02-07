import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  clearRawMaterialsError,
  createRawMaterial,
  deleteRawMaterial,
  fetchRawMaterials,
  updateRawMaterial,
} from '@/store/slices/rawMaterialsSlice';
import { RawMaterial } from '@/types';
import { PageHeader } from '@/components/PageHeader';
import { DataTable } from '@/components/DataTable';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FormDialog } from '@/components/FormDialog';
import { RawMaterialForm } from '@/components/raw-materials/RawMaterialForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';

export function RawMaterialsPage() {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.rawMaterials);

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RawMaterial | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  useEffect(() => {
    void dispatch(fetchRawMaterials());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearRawMaterialsError());
    }
  }, [error, dispatch]);

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (rm: RawMaterial) => {
    setEditingItem(rm);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (data: { code: string; name: string; stockQuantity: number }) => {
    if (editingItem) {
      await dispatch(updateRawMaterial({ id: editingItem.id, payload: data })).unwrap();
      toast.success('Matéria-prima atualizada com sucesso.');
    } else {
      await dispatch(createRawMaterial(data)).unwrap();
      toast.success('Matéria-prima criada com sucesso.');
    }
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget === null) return;
    try {
      await dispatch(deleteRawMaterial(deleteTarget)).unwrap();
      toast.success('Matéria-prima excluída com sucesso.');
    } catch {
      toast.error('Erro ao excluir matéria-prima.');
    }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matérias-primas"
        description="Gerencie o estoque de matérias-primas disponíveis para produção."
        actions={
          <Button onClick={handleOpenNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nova matéria-prima
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Lista de matérias-primas</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={[
              { header: 'Código', className: 'text-center' },
              { header: 'Nome', className: 'text-center' },
              { header: 'Estoque', className: 'text-center' },
              { header: 'Ações', className: 'w-[120px] text-center' },
            ]}
            loading={loading}
            isEmpty={items.length === 0}
            emptyMessage="Nenhuma matéria-prima cadastrada."
          >
            {items.map((rm) => (
              <TableRow key={rm.id}>
                <TableCell className="text-center">
                  <Badge variant="secondary">{rm.code}</Badge>
                </TableCell>
                <TableCell className="font-medium text-center">{rm.name}</TableCell>
                <TableCell className="font-mono text-sm text-center">{rm.stockQuantity.toFixed(3)}</TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-center">
                    <Button variant="ghost" size="icon" aria-label="Editar" onClick={() => handleOpenEdit(rm)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Excluir" onClick={() => setDeleteTarget(rm.id)}>
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
        title={editingItem ? 'Editar matéria-prima' : 'Nova matéria-prima'}
        description={editingItem ? 'Altere os dados da matéria-prima.' : 'Preencha os dados da nova matéria-prima.'}
      >
        <RawMaterialForm
          key={editingItem?.id ?? 'new'}
          editingItem={editingItem}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </FormDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Excluir matéria-prima"
        description="Tem certeza que deseja excluir esta matéria-prima? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
