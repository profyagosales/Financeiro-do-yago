import { ReactNode, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";

export type KPIItem = {
  title: string;
  value: number;
  icon: ReactNode;
  format?: "currency" | "percent" | "number";
  spark?: number[];
  sparkColor?: string;
};

interface KPIBarProps {
  items: KPIItem[];
}

function KpiCard({ title, value, icon, format = "currency", spark, sparkColor }: KPIItem) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex min-w-[160px] flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-sm hover:bg-white/10"
        >
          <div className="flex items-center justify-between text-sm text-neutral-300">
            <span>{title}</span>
            {icon}
          </div>
          <span className="text-xl font-semibold">
            {format === "currency"
              ? formatCurrency(value)
              : format === "percent"
                ? `${value.toFixed(2)}%`
                : value.toLocaleString("pt-BR")}
          </span>
          {spark && (
            <div className="h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spark.map((v, i) => ({ i, v }))}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke={sparkColor ?? "currentColor"}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Detalhes do indicador</DialogDescription>
        </DialogHeader>
        <div className="mt-4 text-center text-2xl font-bold">
          {format === "currency"
            ? formatCurrency(value)
            : format === "percent"
              ? `${value.toFixed(2)}%`
              : value.toLocaleString("pt-BR")}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function KPIBar({ items }: KPIBarProps) {
  return (
    <div className="flex gap-3 overflow-x-auto">
      {items.map((it) => (
        <KpiCard key={it.title} {...it} />
      ))}
    </div>
  );
}
