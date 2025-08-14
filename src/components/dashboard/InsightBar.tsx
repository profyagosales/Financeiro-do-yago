import { WidgetCard, WidgetHeader } from './WidgetCard';

import { Skeleton } from '@/components/ui/Skeleton';
import type { Insight } from '@/hooks/useInsights';

interface Props {
  items: Insight[];
  isLoading?: boolean;
}

export default function InsightBar({ items, isLoading }: Props) {
  return (
    <WidgetCard>
      <WidgetHeader title="Insights" />
      {isLoading ? (
        <Skeleton className="h-4 w-full" />
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((i, idx) => (
            <li key={idx}>{i.message}</li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
