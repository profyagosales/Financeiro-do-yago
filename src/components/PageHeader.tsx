// src/components/PageHeader.tsx
import { ReactNode } from "react";

export type Breadcrumb = { label: string; href?: string };

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  children?: ReactNode;
};

export const PageHeader = ({ title, subtitle, icon, actions, breadcrumbs, children }: PageHeaderProps) => {
  return (
    <div className="mb-6 rounded-xl bg-gradient-to-r from-emerald-900 to-teal-700 text-white">
      <div className="container mx-auto px-4 py-5 flex flex-col gap-4">
        {breadcrumbs && breadcrumbs.length ? (
          <nav className="text-sm text-emerald-100/90">
            {breadcrumbs.map((b, i) => (
              <span key={i}>
                {b.href ? <a href={b.href} className="hover:underline">{b.label}</a> : b.label}
                {i < breadcrumbs.length - 1 ? ' / ' : ''}
              </span>
            ))}
          </nav>
        ) : null}
        <div className="flex items-center justify-between gap-4">
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
      {children ? <div className="container mx-auto px-4 pb-4">{children}</div> : null}
    </div>
  );
};

export default PageHeader;
