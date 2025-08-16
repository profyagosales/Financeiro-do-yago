import { ChevronDown } from 'lucide-react';

import { Button } from './ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from './ui/dropdown-menu';

import { usePeriod } from '@/contexts/PeriodContext';

const periods = [
  { label: 'Mensal', value: 'monthly' },
  { label: 'Trimestral', value: 'quarterly' },
  { label: 'Anual', value: 'yearly' },
  { label: 'Personalizado', value: 'custom' },
] as const;

export function PeriodFilter() {
  const { mode, setMode } = usePeriod();

  const currentPeriod = periods.find((p) => p.value === mode) || periods[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <span>Período: {currentPeriod.label}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {periods.map((period) => (
          <DropdownMenuItem
            key={period.value}
            onSelect={() => setMode(period.value)}
          >
            {period.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
