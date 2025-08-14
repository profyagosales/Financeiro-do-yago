import { Link } from "react-router-dom";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Home, Target, TrendingUp } from "@/components/icons";

interface SuggestionItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const mockSuggestions: SuggestionItem[] = [
  { label: "Visão geral", to: "/dashboard", icon: Home },
  { label: "Investimentos", to: "/investimentos", icon: TrendingUp },
  { label: "Metas", to: "/metas", icon: Target },
];

export default function MenuSuggestions({ compact = false }: { compact?: boolean }) {
  return (
    <div className="mx-3 mb-3 space-y-1">
      {mockSuggestions.map(({ label, to, icon: Icon }) => {
        const content = (
          <Link
            to={to}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-foreground transition hover:bg-background/40 hover:backdrop-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <Icon className="h-5 w-5 opacity-90" />
            {!compact && <span className="text-sm">{label}</span>}
          </Link>
        );

        return compact ? (
          <TooltipProvider delayDuration={200} key={to}>
            <Tooltip>
              <TooltipTrigger asChild>{content}</TooltipTrigger>
              <TooltipContent side="right">{label}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div key={to}>{content}</div>
        );
      })}
    </div>
  );
}
