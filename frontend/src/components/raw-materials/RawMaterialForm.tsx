import { FormEvent, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RawMaterial } from '@/types';

interface RawMaterialFormState {
  code: string;
  name: string;
  stockQuantity: string;
}

interface RawMaterialFormProps {
  editingItem: RawMaterial | null;
  loading: boolean;
  onSubmit: (data: { code: string; name: string; stockQuantity: number }) => Promise<void>;
}

export function RawMaterialForm({ editingItem, loading, onSubmit }: RawMaterialFormProps) {
  const [form, setForm] = useState<RawMaterialFormState>(
    editingItem
      ? { code: editingItem.code, name: editingItem.name, stockQuantity: editingItem.stockQuantity.toString() }
      : { code: '', name: '', stockQuantity: '' }
  );
  const [formError, setFormError] = useState<string | null>(null);

  const resetForm = () => {
    setForm({ code: '', name: '', stockQuantity: '' });
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const stockQuantity = Number(form.stockQuantity);

    if (!form.code.trim() || !form.name.trim()) {
      setFormError('Preencha código e nome da matéria-prima.');
      return;
    }

    if (Number.isNaN(stockQuantity) || stockQuantity < 0) {
      setFormError('Estoque deve ser maior ou igual a zero.');
      return;
    }

    try {
      await onSubmit({
        code: form.code.trim(),
        name: form.name.trim(),
        stockQuantity,
      });
      resetForm();
    } catch (error) {
      setFormError(String(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="rm-code">Código</Label>
          <Input
            id="rm-code"
            value={form.code}
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
            maxLength={50}
            placeholder="Ex.: RM-001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rm-name">Nome</Label>
          <Input
            id="rm-name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ex.: Aço"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rm-stock">Quantidade em estoque</Label>
          <Input
            id="rm-stock"
            type="number"
            step="0.001"
            min="0"
            value={form.stockQuantity}
            onChange={(e) => setForm((prev) => ({ ...prev, stockQuantity: e.target.value }))}
            placeholder="0.000"
          />
        </div>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {editingItem ? 'Atualizar matéria-prima' : 'Salvar matéria-prima'}
        </Button>
      </div>
    </form>
  );
}
