import { Repeat } from 'lucide-react';

import WidgetCard, { WidgetHeader } from './WidgetCard';

import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/utils';

interface RecurrenceItem {
  name: string;
  amount: number;
}

interface RecurrenceListProps {
  items: RecurrenceItem[];
  onClick?: () => void;
}

export default function RecurrenceList({ items, ...rest }: RecurrenceListProps) {
  return (
    <WidgetCard {...rest}>
      <WidgetHeader title="Despesas fixas" />
      {items.length === 0 ? (
        <EmptyState
          icon={<Repeat className="h-6 w-6" />}
          title="Nenhuma despesa fixa"
          action={{ label: 'Adicionar', href: '/financas/mensal' }}
        />
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((r) => (
            <li key={r.name} className="flex justify-between">
              <span>{r.name}</span>
              <span className="font-medium">{formatCurrency(r.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
