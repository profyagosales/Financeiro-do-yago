import { motion, type HTMLMotionProps } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

type WidgetCardProps = PropsWithChildren<{
  className?: string;
  ariaLabelledby?: string;
  role?: string;
  pulse?: boolean; // ativa animação de novo alerta
}> & Omit<HTMLMotionProps<'div'>, 'className'>;

// Generic card used by dashboard widgets.
export function WidgetCard({ className, children, role, ariaLabelledby, pulse, ...rest }: WidgetCardProps) {
  return (
    <motion.div
  className={`rounded-lg bg-white shadow-sm p-6 ${pulse ? 'pulse-border' : ''} ${className ?? ""}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      whileHover={{ y: -4 }}
      role={role}
      aria-labelledby={ariaLabelledby}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function WidgetHeader({ title, subtitle, id }: { title: string; subtitle?: string; id?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-lg font-semibold" id={id}>{title}</h3>
      {subtitle && <p className="text-sm text-[var(--muted-foreground)]">{subtitle}</p>}
    </div>
  );
}

export function WidgetFooterAction({ to, children }: PropsWithChildren<{ to: string }>) {
  return (
    <Link
      to={to}
      className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-emerald-700 hover:underline"
    >
      {children}
      <ChevronRight className="size-4" />
    </Link>
  );
}