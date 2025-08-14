// src/components/home/AlertList.tsx
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

export type Alert = {
  id: string | number;
  title: string;
  description?: string;
};

export type AlertListProps = {
  alerts: Alert[];
  onResolve?: (id: Alert['id']) => void;
};

export default function AlertList({ alerts, onResolve }: AlertListProps) {
  const [selected, setSelected] = useState<Alert | null>(null);

  return (
    <div>
      {alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum alerta.</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <button
                type="button"
                onClick={() => setSelected(a)}
                className="flex-1 text-left"
              >
                <div className="font-medium">{a.title}</div>
                {a.description && <p className="text-muted-foreground">{a.description}</p>}
              </button>
              {onResolve && (
                <button
                  type="button"
                  onClick={() => onResolve(a.id)}
                  className="ml-2 text-emerald-700 hover:underline"
                >
                  Resolvido
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <Dialog.Root open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col bg-background p-4 shadow-xl focus:outline-none">
            {selected && (
              <div className="flex flex-col h-full">
                <Dialog.Title className="text-lg font-semibold">{selected.title}</Dialog.Title>
                <div className="mt-4 flex-1 overflow-auto">
                  {selected.description && <p className="text-sm whitespace-pre-wrap">{selected.description}</p>}
                </div>
                {onResolve && (
                  <button
                    type="button"
                    onClick={() => {
                      onResolve(selected.id);
                      setSelected(null);
                    }}
                    className="mt-4 self-end text-sm text-emerald-700 hover:underline"
                  >
                    Marcar como resolvido
                  </button>
                )}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

