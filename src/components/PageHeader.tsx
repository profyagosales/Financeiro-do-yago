// src/components/PageHeader.tsx
import type { ReactNode } from "react";
import { motion } from 'framer-motion'

import { cn } from "@/lib/utils";

type Breadcrumb = { label: string; href?: string };

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  children?: ReactNode;
  gradient?: string;
  logoSrc?: string;
};

const PageHeader = (props: PageHeaderProps) => {
  const { title, subtitle, icon, actions, breadcrumbs, children, gradient, logoSrc } = props;
  return (
    <motion.div
      className={cn(
        "mb-6 rounded-xl text-white backdrop-blur-sm border-b border-white/10",
        gradient ? `bg-gradient-to-r ${gradient}` : "bg-gradient-to-r from-emerald-600 to-teal-600"
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="container mx-auto px-4 py-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {logoSrc ? (
            <img src={logoSrc} alt="" className="h-8 w-8 shrink-0 rounded-md" />
          ) : icon ? (
            <div className="rounded-lg bg-white/10 p-2 shrink-0">{icon}</div>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold truncate">{title}</h1>
            {subtitle ? (
              <p className="text-white/80 text-sm leading-relaxed truncate">{subtitle}</p>
            ) : null}

            {breadcrumbs && breadcrumbs.length > 0 ? (
              <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-white/80">
                {breadcrumbs.map((b, i) => (
                  <span key={`${b.label}-${i}`} className="inline-flex items-center gap-1">
                    {i > 0 && <span>/</span>}
                    {b.href ? (
                      <a href={b.href} className="underline">
                        {b.label}
                      </a>
                    ) : (
                      <span>{b.label}</span>
                    )}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>

      {children ? <div className="container mx-auto px-4 pb-4">{children}</div> : null}
    </motion.div>
  );
};

export default PageHeader;
export type { Breadcrumb, PageHeaderProps };
