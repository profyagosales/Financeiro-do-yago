import { WidgetCard, WidgetHeader, WidgetFooterAction } from './WidgetCard';

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
      <ul className="space-y-1 text-sm">
        {items.map((r) => (
          <li key={r.name} className="flex justify-between">
            <span>{r.name}</span>
            <span className="font-medium">{formatCurrency(r.amount)}</span>
          </li>
        ))}
      </ul>
      <WidgetFooterAction to="/financas/mensal">Ver detalhes</WidgetFooterAction>
    </WidgetCard>
  );
}
