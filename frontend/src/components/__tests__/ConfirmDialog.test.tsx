import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog', () => {
  it('renders when open', () => {
    render(
      <ConfirmDialog
        open
        title="Confirmar exclusão"
        description="Tem certeza?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText('Confirmar exclusão')).toBeInTheDocument();
    expect(screen.getByText('Tem certeza?')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Confirmar exclusão"
        description="Tem certeza?"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.queryByText('Confirmar exclusão')).not.toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Confirmar exclusão"
        description="Tem certeza?"
        confirmLabel="Excluir"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />
    );

    await userEvent.setup().click(screen.getByText('Excluir'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Confirmar exclusão"
        description="Tem certeza?"
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />
    );

    await userEvent.setup().click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalled();
  });
});
