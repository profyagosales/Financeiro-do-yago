import React, { useEffect, useMemo, useState } from "react";
import { Bell, Sun, Moon, Home, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export type Breadcrumb = { label: string; href?: string };

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode; // opcional: ícone grande à esquerda do título
  breadcrumbs?: Breadcrumb[]; // ex.: [{label: "Finanças", href: "/financas"}, {label: "Mensal"}]
  actions?: React.ReactNode; // botões extras (Novo, Exportar, etc.)
  className?: string;
}

// pequeno helper para não depender de util externo
function cx(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

export function PageHeader({ title, subtitle, icon, breadcrumbs, actions, className }: PageHeaderProps) {
  const [dark, setDark] = useState(() => localStorage.getItem("fy_theme") === "dark");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("fy_theme", dark ? "dark" : "light");
  }, [dark]);

  const crumbs = useMemo(() => breadcrumbs?.filter(Boolean) ?? [], [breadcrumbs]);

  return (
    <div
      className={cx(
        "mb-6 rounded-b-card bg-fy-header text-white",
        // degradê sutil de segurança, caso a classe do tema não exista
        "bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-800 dark:to-slate-800",
        "shadow-sm",
        className
      )}
    >
      <TooltipProvider>
        {/* Top line: breadcrumbs + ações rápidas */}
        {crumbs.length > 0 && (
          <nav className="flex items-center gap-2 px-6 pt-4 text-white/80 text-sm" aria-label="Breadcrumb">
            <a href="/" className="inline-flex items-center hover:text-white">
              <Home size={16} className="mr-1" /> Início
            </a>
            {crumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-2">
                <ChevronRight size={14} className="opacity-70" />
                {c.href ? (
                  <a href={c.href} className="hover:text-white">
                    {c.label}
                  </a>
                ) : (
                  <span className="text-white">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Main line: título + ações */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/20">
                {icon}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
              {subtitle && <p className="text-white/80 text-sm mt-0.5">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actions}

            <Tooltip>
              <TooltipTrigger className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors" aria-label="Notificações">
                <Bell size={18} />
              </TooltipTrigger>
              <TooltipContent>Notificações</TooltipContent>
            </Tooltip>

            <button
              onClick={() => setDark((s) => !s)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Alternar tema"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}

export default PageHeader;