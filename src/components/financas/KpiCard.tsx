import { type ReactNode, useEffect, useState } from "react";
import { motion, animate, useMotionValue } from "framer-motion";

import { formatCurrency } from "@/lib/utils";
import SkeletonLine from "@/components/ui/SkeletonLine";

export interface KpiCardProps {
  icon: ReactNode;
  title: string;
  value: number;
  delta?: number;
  isLoading?: boolean;
  onClick?: () => void;
}

function CountUp({ value }: { value: number }) {
  const mv = useMotionValue(0);
  const [out, setOut] = useState(0);
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.5, ease: "easeOut" });
    const unsub = mv.on("change", (v) => setOut(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, mv]);
  return <span>{formatCurrency(Math.round(out))}</span>;
}

export default function KpiCard({
  icon,
  title,
  value,
  delta,
  isLoading,
  onClick,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="kpi flex items-center gap-4"
      >
        <motion.div
          className="kpi-icon"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        >
          {icon}
        </motion.div>
        <div className="flex-1 space-y-2">
          <SkeletonLine className="h-4 w-24" />
          <SkeletonLine className="h-6 w-32" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      className="kpi cursor-pointer"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start gap-4">
        <div className="kpi-icon" aria-hidden>
          {icon}
        </div>
        <div>
          <p className="kpi-title">{title}</p>
          <p className="kpi-value">
            <CountUp value={value} />
          </p>
          {delta !== undefined && (
            <p
              className={`mt-1 text-xs font-medium ${
                delta >= 0 ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {delta >= 0 ? "+" : "-"}
              {formatCurrency(Math.abs(delta))}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
