import WidgetCard from './WidgetCard';

interface InsightCardProps {
  message: string;
  onClick?: () => void;
}

export default function InsightCard({ message, ...rest }: InsightCardProps) {
  return (
    <WidgetCard title="Insights" {...rest}>
      <p className="text-sm text-muted-foreground">{message}</p>
    </WidgetCard>
  );
}
