import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// Generic card used by dashboard widgets.
export function WidgetCard({ className, children }: PropsWithChildren<{ className?: string }>) {
  return <div className={`card-surface p-5 sm:p-6 ${className ?? ""}`}>{children}</div>;
}

export function WidgetHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
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
