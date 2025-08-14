import { Wallet, ArrowDownCircle, ArrowUpCircle, TrendingUp, Target, AlertTriangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/lib/utils";

interface KPIStripProps {
  saldo: number;
  entradasMes: number;
  saidasMes: number;
  rentYtd: number;
  metasConcluidas: number;
  alertasAbertos: number;
}

interface KPIItem {
  label: string;
  icon: LucideIcon;
  value: number;
  format: "currency" | "percent" | "number";
  tooltip?: string;
}

function KpiCard({ icon: Icon, label, value, format, tooltip }: KPIItem) {
  const content = (
    <div className="flex min-w-[140px] flex-col gap-1 rounded-xl px-4 py-3 bg-white/5 ring-1 ring-white/10">
      <Icon className="h-4 w-4 text-neutral-200" />
      <span className="text-xl font-semibold">
        {format === "currency"
          ? formatCurrency(value)
          : format === "percent"
            ? `${value.toFixed(2)}%`
            : value.toLocaleString("pt-BR")}
      </span>
      <span className="text-sm text-neutral-300">{label}</span>
    </div>
  );

  if (tooltip) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  return content;
}

export default function KPIStrip({
  saldo,
  entradasMes,
  saidasMes,
  rentYtd,
  metasConcluidas,
  alertasAbertos,
}: KPIStripProps) {
  const items: KPIItem[] = [
    { label: "Saldo", icon: Wallet, value: saldo, format: "currency" },
    { label: "Entradas", icon: ArrowDownCircle, value: entradasMes, format: "currency" },
    { label: "Saídas", icon: ArrowUpCircle, value: saidasMes, format: "currency" },
    {
      label: "Rent. YTD",
      icon: TrendingUp,
      value: rentYtd,
      format: "percent",
      tooltip: "Rentabilidade acumulada no ano",
    },
    {
      label: "Metas concluídas",
      icon: Target,
      value: metasConcluidas,
      format: "number",
    },
    {
      label: "Alertas abertos",
      icon: AlertTriangle,
      value: alertasAbertos,
      format: "number",
    },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto md:grid md:grid-cols-3 lg:grid-cols-6">
      {items.map((item) => (
        <KpiCard key={item.label} {...item} />
      ))}
    </div>
  );
}

