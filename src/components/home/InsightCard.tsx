import type { ReactNode } from "react";
import { AlertCircle, Plane, Receipt, Target, TrendingUp, Utensils, Wallet } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Insight } from "@/hooks/useInsights";

function iconFor(id: string): ReactNode {
  if (id.startsWith("food")) return <Utensils className="h-5 w-5" />;
  if (id.startsWith("cat")) return <TrendingUp className="h-5 w-5" />;
  if (id.startsWith("budget")) return <Wallet className="h-5 w-5" />;
  if (id.startsWith("mile")) return <Plane className="h-5 w-5" />;
  if (id.startsWith("bill")) return <Receipt className="h-5 w-5" />;
  if (id.startsWith("goal")) return <Target className="h-5 w-5" />;
  return <AlertCircle className="h-5 w-5" />;
}

export default function InsightCard({ insight }: { insight: Insight }) {
  const icon = iconFor(insight.id);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group card-surface flex w-full items-start gap-3 p-4 text-left transition-transform hover:-translate-y-0.5 hover:shadow-lg"
        >
          <span className="mt-1 text-emerald-600 dark:text-emerald-400">{icon}</span>
          <span className="text-sm text-foreground/90 group-hover:text-foreground">
            {insight.message}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            Insight
          </DialogTitle>
          <DialogDescription>{insight.message}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

