import { motion } from "framer-motion";
import { Target } from "lucide-react";

import { useGoals } from "@/hooks/useGoals";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MetasSummary() {
  const { data } = useGoals();
  const topGoals = [...data]
    .sort((a, b) => (b.progress_pct || 0) - (a.progress_pct || 0))
    .slice(0, 3);
  if (topGoals.length === 0) {
    return (
      <EmptyState
        icon={<Target className="h-6 w-6" />}
        title="Nenhuma meta"
        action={{ label: "Criar meta", href: "/metas" }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {topGoals.map((g) => {
        const pct = Math.round(g.progress_pct || 0);
        return (
          <div key={g.id}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="text-muted-foreground">{g.title}</span>
              <span className="text-foreground">{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-primary/20">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
