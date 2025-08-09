// src/components/PageHeader.tsx
import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, icon, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-700 text-white">
      <div className="container mx-auto px-4 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {icon ? <div className="rounded-lg bg-white/10 p-2 shrink-0">{icon}</div> : null}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold truncate">{title}</h1>
            {subtitle ? (
              <p className="text-white/80 text-sm leading-relaxed truncate">{subtitle}</p>
            ) : null}
          </div>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  );
}