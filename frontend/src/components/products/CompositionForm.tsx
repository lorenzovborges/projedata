import { FormEvent, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RawMaterial } from '@/types';

interface CompositionFormProps {
  rawMaterials: RawMaterial[];
  editingRawMaterialId: string;
  editingQuantity: string;
  loading: boolean;
  isEditing: boolean;
  onSubmit: (rawMaterialId: number, requiredQuantity: number) => Promise<void>;
  onCancelEdit: () => void;
}

export function CompositionForm({
  rawMaterials,
  editingRawMaterialId,
  editingQuantity,
  loading,
  isEditing,
  onSubmit,
  onCancelEdit,
}: CompositionFormProps) {
  const [rawMaterialId, setRawMaterialId] = useState(editingRawMaterialId);
  const [requiredQuantity, setRequiredQuantity] = useState(editingQuantity);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const rmId = Number(rawMaterialId);
    const qty = Number(requiredQuantity);

    if (Number.isNaN(rmId) || rmId <= 0) {
      setFormError('Selecione uma matéria-prima válida.');
      return;
    }

    if (Number.isNaN(qty) || qty <= 0) {
      setFormError('A quantidade necessária deve ser maior que zero.');
      return;
    }

    try {
      await onSubmit(rmId, qty);
      setRawMaterialId('');
      setRequiredQuantity('');
    } catch (error) {
      setFormError(String(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
        <div className="space-y-2">
          <Label htmlFor="comp-material">Matéria-prima</Label>
          <Select
            id="comp-material"
            value={rawMaterialId}
            onChange={(e) => setRawMaterialId(e.target.value)}
          >
            <option value="">Selecione</option>
            {rawMaterials.map((rm) => (
              <option key={rm.id} value={rm.id}>
                {rm.code} - {rm.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="comp-qty">Quantidade necessária</Label>
          <Input
            id="comp-qty"
            type="number"
            step="0.001"
            min="0"
            value={requiredQuantity}
            onChange={(e) => setRequiredQuantity(e.target.value)}
            placeholder="0.000"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {isEditing ? 'Atualizar composição' : 'Adicionar à composição'}
        </Button>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {isEditing && (
        <Button type="button" variant="outline" onClick={onCancelEdit}>
          Cancelar edição
        </Button>
      )}
    </form>
  );
}
