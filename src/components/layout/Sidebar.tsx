import { useState, type ComponentType, type SVGProps } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Target,
  Plane,
  ShoppingCart,
  Heart,
  Wallet,
  CalendarDays,
  CalendarRange,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  label: string;
  to?: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  children?: NavItem[];
}

const items: NavItem[] = [
  { label: "Visão Geral", to: "/dashboard", icon: LayoutDashboard },
  { label: "Investimentos", to: "/investimentos/resumo", icon: TrendingUp },
  { label: "Metas e Projetos", to: "/metas", icon: Target },
  { label: "Milhas", to: "/milhas", icon: Plane },
  { label: "Lista de Compras", to: "/compras", icon: ShoppingCart },
  { label: "Lista de Desejos", to: "/desejos", icon: Heart },
  {
    label: "Finanças",
    icon: Wallet,
    children: [
      { label: "Mensal", to: "/financas/mensal", icon: CalendarDays },
      { label: "Anual", to: "/financas/anual", icon: CalendarRange },
    ],
  },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const avatarUrl = (user as any)?.user_metadata?.avatar_url as string | undefined;
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) || user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col bg-gradient-to-b from-white/10 dark:from-black/10",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-3">
        {!collapsed && <span className="text-sm font-semibold">Menu</span>}
        <button
          aria-label="Alternar modo compacto"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-md p-2 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-200 ease-out"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => setOpen(!open)}
                  className="flex w-full items-center rounded-md p-2 text-sm hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-200 ease-out"
                >
                  <Icon className="h-5 w-5" />
                  {!collapsed && (
                    <span className="ml-3 flex-1 text-left">{item.label}</span>
                  )}
                  {!collapsed && (
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        open ? "rotate-180" : ""
                      )}
                    />
                  )}
                </button>
                {open && !collapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      return (
                        <NavLink
                          key={child.to}
                          to={child.to!}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center rounded-md p-2 text-sm hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-200 ease-out",
                              isActive && "bg-white/20 dark:bg-black/20"
                            )
                          }
                        >
                          <ChildIcon className="h-4 w-4" />
                          <span className="ml-2">{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to!}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md p-2 text-sm hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-200 ease-out",
                  isActive && "bg-white/20 dark:bg-black/20"
                )
              }
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 p-3">
        <div
          className={cn(
            "flex items-center gap-2",
            collapsed && "justify-center"
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
              {initials}
            </span>
          )}
          {!collapsed && (
            <>
              <span className="text-sm font-medium">{displayName}</span>
              <NavLink
                to="/configuracoes"
                aria-label="Configurações"
                className="ml-auto rounded-md p-2 hover:bg-white/10 dark:hover:bg-black/10 transition-all duration-200 ease-out"
              >
                <Settings className="h-4 w-4" />
              </NavLink>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

