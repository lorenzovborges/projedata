import { FormEvent, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Product } from '@/types';

interface ProductFormState {
  code: string;
  name: string;
  value: string;
}

interface ProductFormProps {
  editingItem: Product | null;
  loading: boolean;
  onSubmit: (data: { code: string; name: string; value: number }) => Promise<void>;
}

export function ProductForm({ editingItem, loading, onSubmit }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormState>(
    editingItem
      ? { code: editingItem.code, name: editingItem.name, value: editingItem.value.toString() }
      : { code: '', name: '', value: '' }
  );
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const value = Number(form.value);

    if (!form.code.trim() || !form.name.trim()) {
      setFormError('Preencha código e nome do produto.');
      return;
    }

    if (Number.isNaN(value) || value <= 0) {
      setFormError('Informe um valor maior que zero.');
      return;
    }

    try {
      await onSubmit({
        code: form.code.trim(),
        name: form.name.trim(),
        value,
      });
    } catch (error) {
      setFormError(String(error));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="prod-code">Código</Label>
          <Input
            id="prod-code"
            value={form.code}
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
            maxLength={50}
            placeholder="Ex.: PRD-001"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prod-name">Nome</Label>
          <Input
            id="prod-name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ex.: Produto premium"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="prod-value">Valor</Label>
          <Input
            id="prod-value"
            type="number"
            step="0.01"
            min="0"
            value={form.value}
            onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
            placeholder="0.00"
          />
        </div>
      </div>

      {formError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={loading}>
        {editingItem ? 'Atualizar produto' : 'Salvar produto'}
      </Button>
    </form>
  );
}
