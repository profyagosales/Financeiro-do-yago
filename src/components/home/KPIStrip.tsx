import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { cn } from '@/lib/utils';

export interface KpiMetric {
  title: string;
  icon: LucideIcon;
  value: number;
  color: string;
}

export function KpiCard({ title, icon: Icon, value, color }: KpiMetric) {
  return (
    <motion.div
      className="flex flex-col gap-1 rounded-xl bg-card p-4 text-card-foreground"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Icon className={cn('h-5 w-5', color)} />
      <AnimatedNumber value={value} currency={false} className={cn('text-3xl', color)} />
      <span className="text-sm text-muted-foreground">{title}</span>
    </motion.div>
  );
}

export function KPIStrip({ metrics }: { metrics: KpiMetric[] }) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))` }}
    >
      {metrics.map((m) => (
        <KpiCard key={m.title} {...m} />
      ))}
    </div>
  );
}
