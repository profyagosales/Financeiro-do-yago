import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  WalletCards,
  TrendingUp,
  Target,
  Plane,
  ShoppingCart,
  Heart,
  ChevronDown,
} from "lucide-react";

export interface NavMenuChild {
  label: string;
  to: string;
}

export interface NavMenuItem {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  to?: string;
  children?: NavMenuChild[];
}

export const defaultNavItems: NavMenuItem[] = [
  { label: "Visão geral", icon: LayoutDashboard, to: "/dashboard" },
  {
    label: "Finanças",
    icon: WalletCards,
    children: [
      { label: "Resumo", to: "/financas/resumo" },
      { label: "Mensal", to: "/financas/mensal" },
      { label: "Anual", to: "/financas/anual" },
    ],
  },
  {
    label: "Investimentos",
    icon: TrendingUp,
    children: [
      { label: "Resumo", to: "/investimentos/resumo" },
      { label: "Renda fixa", to: "/investimentos/renda-fixa" },
      { label: "FIIs", to: "/investimentos/fiis" },
      { label: "Bolsa", to: "/investimentos/bolsa" },
      { label: "Cripto", to: "/investimentos/cripto" },
    ],
  },
  { label: "Metas & Projetos", icon: Target, to: "/metas" },
  { label: "Milhas", icon: Plane, to: "/milhas" },
  { label: "Lista de compras", icon: ShoppingCart, to: "/compras" },
  { label: "Lista de desejos", icon: Heart, to: "/desejos" },
];

export function NavMenu({
  items = defaultNavItems,
}: {
  items?: NavMenuItem[];
}) {
  const location = useLocation();
  const [open, setOpen] = React.useState<string | null>(null);

  const activeTop = React.useMemo(() => {
    for (const item of items) {
      if (item.children) {
        if (item.children.some((c) => location.pathname.startsWith(c.to))) {
          return item.label;
        }
      } else if (item.to && location.pathname.startsWith(item.to)) {
        return item.label;
      }
    }
    return null;
  }, [location.pathname, items]);

  return (
    <nav className="relative">
      <ul className="flex items-center gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTop === item.label;

          if (item.children) {
            const isOpen = open === item.label;
            return (
              <li
                key={item.label}
                className="relative"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setOpen(null);
                  }
                }}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : item.label)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpen(isOpen ? null : item.label);
                    }
                    if (e.key === "Escape") {
                      setOpen(null);
                      (e.currentTarget as HTMLElement).blur();
                    }
                  }}
                  aria-expanded={isOpen}
                  className={[
                    "relative flex items-center gap-1 rounded-full px-3 py-1 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                    isActive
                      ? "text-emerald-300"
                      : "text-slate-300 hover:text-white hover:bg-emerald-600/10",
                  ].join(" ")}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  <span>{item.label}</span>
                  <ChevronDown
                    className={`h-[18px] w-[18px] transition-transform ${isOpen ? "rotate-180" : ""}`}
                    strokeWidth={1.5}
                  />
                  {isActive && (
                    <>
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-emerald-500/15"
                      />
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute left-2 right-2 -bottom-1 h-0.5 bg-emerald-500"
                      />
                    </>
                  )}
                </button>
                {isOpen && (
                  <ul className="absolute left-0 mt-2 w-48 rounded-md bg-slate-900/95 p-1 shadow-lg ring-1 ring-black/20 z-10">
                    {item.children.map((child) => (
                      <li key={child.to}>
                        <NavLink
                          to={child.to}
                          className={({ isActive }) =>
                            [
                              "block rounded-md px-3 py-2 text-sm transition hover:bg-emerald-600/10",
                              isActive
                                ? "text-emerald-300"
                                : "text-slate-300 hover:text-white",
                            ].join(" ")
                          }
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          }

          return (
            <li key={item.to} className="relative">
              <NavLink
                to={item.to!}
                className="relative rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
              >
                {({ isActive }) => (
                  <div
                    className={[
                      "relative flex items-center gap-1 rounded-full px-3 py-1 text-sm transition",
                      isActive
                        ? "text-emerald-300"
                        : "text-slate-300 hover:text-white hover:bg-emerald-600/10",
                    ].join(" ")}
                  >
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                    <span>{item.label}</span>
                    {isActive && (
                      <>
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-emerald-500/15"
                        />
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute left-2 right-2 -bottom-1 h-0.5 bg-emerald-500"
                        />
                      </>
                    )}
                  </div>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default NavMenu;
