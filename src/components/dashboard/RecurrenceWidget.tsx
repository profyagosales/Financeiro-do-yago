import { WidgetCard, WidgetHeader } from './WidgetCard';

import { Skeleton } from '@/components/ui/Skeleton';
import type { Recurrence } from '@/hooks/useRecurrences';
import { formatCurrency } from '@/lib/utils';

interface Props {
  items: Recurrence[];
  isLoading?: boolean;
}

export default function RecurrenceWidget({ items, isLoading }: Props) {
  return (
    <WidgetCard>
      <WidgetHeader title="Recorrências" />
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((r) => (
            <li key={r.description} className="flex justify-between">
              <span>{r.description}</span>
              <span className="font-medium">{formatCurrency(r.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
