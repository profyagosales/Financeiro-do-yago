import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  WalletCards,
  TrendingUp,
  ChevronDown,
  PieChart,
  CalendarDays,
  CalendarRange,
  Landmark,
  Building2,
  CandlestickChart,
  Bitcoin,
} from "lucide-react";

import { ShoppingCart, Heart, Target, Plane, LineChart } from "@/components/icons";

export interface NavMenuChild {
  label: string;
  to: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
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
      { label: "Resumo", to: "/financas/resumo", icon: PieChart },
      { label: "Mensal", to: "/financas/mensal", icon: CalendarDays },
      { label: "Anual", to: "/financas/anual", icon: CalendarRange },
    ],
  },
  {
    label: "Investimentos",
    icon: TrendingUp,
    children: [
      { label: "Resumo", to: "/investimentos/resumo", icon: LineChart },
      {
        label: "Renda fixa",
        to: "/investimentos/renda-fixa",
        icon: Landmark,
      },
      { label: "FIIs", to: "/investimentos/fiis", icon: Building2 },
      { label: "Bolsa", to: "/investimentos/bolsa", icon: CandlestickChart },
      { label: "Cripto", to: "/investimentos/cripto", icon: Bitcoin },
    ],
  },
  { label: "Metas & Projetos", icon: Target, to: "/metas" },
  { label: "Milhas", icon: Plane, to: "/milhas" },
  { label: "Desejos", icon: Heart, to: "/desejos" },
  { label: "Compras", icon: ShoppingCart, to: "/compras" },
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
                    "relative flex items-center gap-2 rounded-full px-3 py-1 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
                    isActive
                      ? "text-emerald-300"
                      : "text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-emerald-600/10",
                  ].join(" ")}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  <span>{item.label}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
                <AnimatePresence>
                  {isOpen && (
                    <motion.ul
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="menu-dropdown absolute left-0 mt-2 w-56 z-10"
                    >
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <li key={child.to}>
                            <NavLink
                              to={child.to}
                              className={({ isActive }) =>
                                [
                                  "menu-item",
                                  isActive
                                    ? "text-emerald-600 dark:text-emerald-300"
                                    : "",
                                ].join(" ")
                              }
                            >
                              <ChildIcon className="h-4 w-4" strokeWidth={1.5} />
                              <span>{child.label}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
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
                      "relative flex items-center gap-2 rounded-full px-3 py-1 text-sm transition",
                      isActive
                        ? "text-emerald-300"
                        : "text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-emerald-600/10",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
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
