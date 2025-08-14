import { WidgetCard, WidgetHeader } from './WidgetCard';

import { Skeleton } from '@/components/ui/Skeleton';
import type { Alert } from '@/hooks/useAlerts';

interface Props {
  alerts: Alert[];
  isLoading?: boolean;
}

export default function AlertsDrawer({ alerts, isLoading }: Props) {
  return (
    <WidgetCard>
      <WidgetHeader title="Alertas" />
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <ul className="space-y-1 text-sm">
          {alerts.map((a, idx) => (
            <li key={idx}>{a.message}</li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
