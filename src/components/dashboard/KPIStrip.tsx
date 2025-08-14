import type { LucideIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface KPIMetric {
  icon: LucideIcon;
  label: string;
  value: string | number;
  comparison: string;
  tooltip: string;
}

export default function KPIStrip({ metrics }: { metrics: KPIMetric[] }) {
  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <div className="flex gap-4 pb-2">
          {metrics.map((m) => (
            <Tooltip key={m.label}>
              <TooltipTrigger asChild>
                <div className="min-w-[180px] shrink-0 rounded-lg border bg-card p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2 text-muted-foreground">
                    <m.icon className="h-4 w-4" />
                    <span className="text-xs font-medium">{m.label}</span>
                  </div>
                  <div className="text-lg font-semibold leading-none">{m.value}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{m.comparison}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>{m.tooltip}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
