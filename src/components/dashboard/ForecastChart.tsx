import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Wallet } from "lucide-react";

import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/utils";

export type FluxoItem = { m: string; in: number; out: number; saldo: number };

// Chart used on the dashboard to show monthly cash flow.
export default function ForecastChart({ data }: { data: FluxoItem[] }) {
  return (
    <div className="h-[220px]">
      {data.length === 0 ? (
        <EmptyState icon={<Wallet className="h-8 w-8" />} title="Sem dados" />
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: 8 }} barCategoryGap={24} barGap={8}>
            <defs>
              <linearGradient id="saldoFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--chart-emerald))" stopOpacity={0.35} />
                <stop offset="100%" stopColor="hsl(var(--chart-emerald))" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="2 4" />
            <XAxis dataKey="m" tickMargin={8} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => formatCurrency(Number(v)).replace(/^R\$\s?/, "")}
              width={64}
              tickMargin={8}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v: unknown) => formatCurrency(Number(v))}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--chart-tooltip-bg))",
                color: "hsl(var(--chart-tooltip-fg))",
              }}
              wrapperStyle={{ outline: "none" }}
            />
            <Bar dataKey="in" fill="hsl(var(--chart-blue))" fillOpacity={0.95} radius={[8, 8, 0, 0]} />
            <Bar dataKey="out" fill="hsl(var(--chart-rose))" fillOpacity={0.92} radius={[8, 8, 0, 0]} />
            <Area type="monotone" dataKey="saldo" stroke="hsl(var(--chart-emerald))" fill="url(#saldoFill)" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
