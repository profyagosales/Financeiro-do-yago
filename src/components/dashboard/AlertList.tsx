import WidgetCard from './WidgetCard';

interface Alert {
  message: string;
}

interface AlertListProps {
  alerts: Alert[];
  onClick?: () => void;
}

export default function AlertList({ alerts, ...rest }: AlertListProps) {
  return (
    <WidgetCard title="Alertas" {...rest}>
      {alerts.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum alerta</p>
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
