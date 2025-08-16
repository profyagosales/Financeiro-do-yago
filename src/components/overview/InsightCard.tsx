import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface InsightCardProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  onClick?: () => void;
}

export default function InsightCard({ icon, title, subtitle, onClick }: InsightCardProps) {
  return (
    <motion.div
      role="button"
      aria-haspopup="dialog"
      tabIndex={0}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className="rounded-2xl bg-background/40 backdrop-blur border border-white/10 shadow-sm hover:shadow-lg transition-shadow cursor-pointer p-4 flex items-center gap-3"
    >
      <span className="text-2xl">{icon}</span>
      <div className="flex flex-col">
        <span className="font-medium leading-none">{title}</span>
  <span className="text-sm text-fg-muted">{subtitle}</span>
      </div>
    </motion.div>
  );
}

