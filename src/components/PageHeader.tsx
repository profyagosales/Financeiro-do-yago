// src/components/PageHeader.tsx
import { motion } from 'framer-motion';
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Breadcrumb = { label: string; href?: string };

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Breadcrumb[];
  children?: ReactNode;
  /**
   * Mantido para compat: caso ainda seja passado, aplica classes extras depois do gradiente padrão baseado em var(--clr-active)
   */
  gradient?: string;
  logoSrc?: string;
  className?: string;
};

const PageHeader = (props: PageHeaderProps) => {
  const { title, subtitle, icon, actions, breadcrumbs, children, gradient, logoSrc, className } = props;
  return (
    <motion.div
      className={cn(
        "mb-6 rounded-2xl text-white backdrop-blur-sm border border-white/10 overflow-hidden relative",
        // Base hero gradient driven por --clr-active; fallback mantém aparência antiga
        "bg-[linear-gradient(90deg,var(--clr-active)_0%,var(--clr-active)_55%,rgba(255,255,255,0.15)_100%)] dark:bg-[linear-gradient(90deg,var(--clr-active)_0%,var(--clr-active)_50%,rgba(255,255,255,0.08)_100%)]",
        gradient && `after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-r ${gradient} after:opacity-70`,
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="container mx-auto px-4 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {logoSrc ? (
            <img src={logoSrc} alt="" className="h-8 w-8 shrink-0 rounded-md" />
          ) : icon ? (
            <div className="rounded-lg bg-white/10 p-2 shrink-0">{icon}</div>
          ) : null}
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight truncate drop-shadow-sm">{title}</h1>
            {subtitle ? (
              <p className="text-white/85 text-sm leading-relaxed truncate">{subtitle}</p>
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

  {children ? <div className="container mx-auto px-4 pb-6">{children}</div> : null}
    </motion.div>
  );
};

export default PageHeader;
export type { Breadcrumb, PageHeaderProps };
