import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type OverviewPoint = {
  m: string;
  in: number;
  out: number;
  saldo: number;
};

interface OverviewChartProps {
  data: OverviewPoint[];
}

export default function OverviewChart({ data }: OverviewChartProps) {
  const [open, setOpen] = useState(false);

  const smallChart = (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <XAxis dataKey="m" hide />
        <YAxis hide />
        <Tooltip />
        <Area type="monotone" dataKey="saldo" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
      </AreaChart>
    </ResponsiveContainer>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="cursor-pointer">{smallChart}</div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Fluxo de caixa</DialogTitle>
        </DialogHeader>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis dataKey="m" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="in" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
              <Area type="monotone" dataKey="out" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
              <Area type="monotone" dataKey="saldo" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
}
