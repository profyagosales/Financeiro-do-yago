import { useEffect, useState, type ReactNode } from "react";
import { motion, useMotionValue, animate } from "framer-motion";

import { formatCurrency } from "@/lib/utils";

export type KpiItem = {
  title: string;
  icon: ReactNode;
  value: number;
  trend?: "up" | "down";
  colorFrom: string;
  colorTo: string;
  spark: number[];
  sparkColor: string;
};

// Renders a strip of KPI cards. Each card contains a small
// sparkline and an animated counter.
export default function KPIStrip({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((k) => (
        <KpiCard key={k.title} {...k} />
      ))}
    </div>
  );
}

function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const [out, setOut] = useState(0);
  useEffect(() => {
    const ctrl = animate(mv, value, { duration: 1.1, ease: "easeOut" });
    const unsub = mv.on("change", (v) => setOut(v));
    return () => {
      ctrl.stop();
      unsub();
    };
  }, [value, mv]);
  return <span>{formatCurrency(Math.round(out))}</span>;
}

function Sparkline({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  const w = 88,
    h = 28,
    pad = 2;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - pad * 2) + pad;
    const y = h - (norm(v) * (h - pad * 2) + pad);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  const path = `M ${pts.join(" L ")}`;
  const last = pts[pts.length - 1]?.split(",") || ["0", "0"];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.45" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${w - pad},${h - pad} L ${pad},${h - pad} Z`} fill="url(#sparkFill)" />
      <path d={path} stroke={color} strokeWidth={2} fill="none" strokeLinecap="round" />
      <circle cx={Number(last[0])} cy={Number(last[1])} r={2.2} fill={color} />
    </svg>
  );
}

function KpiCard({
  title,
  icon,
  value,
  trend,
  colorFrom,
  colorTo,
  spark,
  sparkColor,
}: KpiItem) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="kpi relative h-[136px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 -z-10 h-28 w-28 rounded-full opacity-25 blur-2xl"
        style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
      />
      <div className="relative z-10 flex flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="kpi-icon"
              style={{ background: `linear-gradient(135deg, ${colorFrom}, ${colorTo})` }}
            >
              {icon}
            </div>
            <div>
              <p className="kpi-title">{title}</p>
              <p className="kpi-value">
                <CountUp value={value} />
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <Sparkline data={spark} color={sparkColor} />
          </div>
        </div>
        {trend === "up" ? (
          <span
            aria-hidden
            className="pointer-events-none mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
          >
            <span aria-hidden className="pointer-events-none opacity-25">▲</span>
            bom
          </span>
        ) : trend === "down" ? (
          <span
            aria-hidden
            className="pointer-events-none mt-2 inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-1 text-xs font-medium text-rose-700"
          >
            <span aria-hidden className="pointer-events-none opacity-25">▼</span>
            atenção
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}
