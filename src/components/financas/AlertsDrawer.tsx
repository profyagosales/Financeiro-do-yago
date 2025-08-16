import * as Dialog from '@radix-ui/react-dialog';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import type { AlertType } from '@/hooks/useAlerts';
import { useAlerts } from '@/hooks/useAlerts';

const labels: Record<AlertType, { name: string; to: string }> = {
  bills: { name: 'Contas a vencer', to: '/financas/mensal' },
  budget: { name: 'Orçamento', to: '/financas/resumo' },
  goals: { name: 'Metas', to: '/metas' },
  miles: { name: 'Milhas', to: '/milhas' },
};

export default function AlertsDrawer() {
  const { config, updateConfig, activeAlerts, count } = useAlerts();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl text-white hover:bg-white/20"
          aria-label="Alertas"
        >
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-medium text-white">
              {count}
            </span>
          )}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed right-0 top-0 z-50 flex h-full w-80 flex-col bg-background p-4 shadow-xl focus:outline-none">
          <Dialog.Title className="text-lg font-semibold">Alertas</Dialog.Title>
          <div className="mt-4 flex-1 overflow-auto">
            {activeAlerts.length === 0 ? (
              <p className="text-sm text-fg-muted">Sem alertas ativos.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {activeAlerts.map((a) => (
                  <li key={a.type} className="flex items-center justify-between rounded-md border p-2">
                    <span>{labels[a.type].name}</span>
                    <Link
                      to={a.cta}
                      className="text-emerald-700 hover:underline"
                    >
                      Ver
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 space-y-4">
              {(['bills', 'budget', 'goals', 'miles'] as AlertType[]).map((key) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-sm font-medium">{labels[key].name}</span>
                    <Input
                      type="number"
                      value={config[key].limit}
                      onChange={(e) =>
                        updateConfig(key, { limit: Number(e.target.value) })
                      }
                      className="h-8 w-20 text-sm"
                    />
                  </div>
                  <Switch
                    checked={config[key].enabled}
                    onCheckedChange={(v) => updateConfig(key, { enabled: v })}
                  />
                </div>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

