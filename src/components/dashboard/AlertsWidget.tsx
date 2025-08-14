import { Bell } from "lucide-react";

import { WidgetCard, WidgetHeader } from "./WidgetCard";

import { EmptyState } from "@/components/ui/EmptyState";

interface AlertMessage {
  message: string;
}

export default function AlertsWidget({ alerts, ...rest }: { alerts: AlertMessage[]; onClick?: () => void }) {
  return (
    <WidgetCard {...rest}>
      <WidgetHeader title="Alertas" />
      {alerts.length === 0 ? (
        <EmptyState icon={<Bell className="h-6 w-6" />} title="Nenhum alerta" />
      ) : (
        <ul className="space-y-1 text-sm">
          {alerts.map((a, i) => (
            <li key={i}>{a.message}</li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}
