import { WidgetCard, WidgetHeader, WidgetFooterAction } from './WidgetCard';

import { formatCurrency } from '@/lib/utils';

interface BalanceForecastProps {
  current: number;
  forecast: number;
  onClick?: () => void;
}

export default function BalanceForecast({ current, forecast, ...rest }: BalanceForecastProps) {
  const diff = forecast - current;
  return (
    <WidgetCard {...rest}>
      <WidgetHeader title="Saldo em 30 dias" />
      <p className="text-2xl font-semibold">{formatCurrency(forecast)}</p>
      <p className="text-sm text-muted-foreground">
        {diff >= 0 ? '+' : '-'}{formatCurrency(Math.abs(diff))} em relação ao atual
      </p>
      <WidgetFooterAction to="/financas/anual" label="Ver detalhes" />
    </WidgetCard>
  );
}
