import * as React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import * as RTooltip from "@radix-ui/react-tooltip";
import {
  LayoutDashboard,
  CalendarRange,
  PiggyBank,
  Landmark,
  Building2,
  CandlestickChart,
  Coins,
  Gift,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";


import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import { ShoppingCart, Settings, Target, Plane } from "@/components/icons";
import { useAuth } from "@/contexts/AuthContext";

type NavLeaf = { type: "item"; label: string; to: string; icon?: React.ElementType; title?: string };
type NavGroup = { type: "group"; label: string; icon?: React.ElementType; children: NavLeaf[] };
type Section = { label: string; items: (NavLeaf | NavGroup)[] };

const sections: Section[] = [
  {
    label: "Geral",
    items: [{ type: "item", label: "Visão geral", to: "/homeoverview", icon: LayoutDashboard }],
  },
  {
    label: "Finanças",
    items: [
      { type: "item", label: "Resumo", to: "/financas/resumo", icon: LayoutDashboard },
      { type: "item", label: "Mensal", to: "/financas/mensal", icon: CalendarRange },
      { type: "item", label: "Anual", to: "/financas/anual", icon: CalendarRange },
    ],
  },
  {
    label: "Investimentos",
    items: [
      { type: "item", label: "Resumo", to: "/investimentos/resumo", icon: PiggyBank },
      {
        type: "group",
        label: "Carteira",
        icon: Landmark,
        children: [
          { type: "item", label: "Renda Fixa", to: "/investimentos/renda-fixa", icon: Landmark },
          { type: "item", label: "FIIs", to: "/investimentos/fiis", icon: Building2 },
          { type: "item", label: "Bolsa", to: "/investimentos/bolsa", icon: CandlestickChart },
          { type: "item", label: "Cripto", to: "/investimentos/cripto", icon: Coins },
        ],
      },
    ],
  },
  {
    label: "Planejamento",
    items: [
      { type: "item", label: "Metas & Projetos", to: "/metas", icon: Target },
      { type: "item", label: "Milhas", to: "/milhas", icon: Plane },
      { type: "item", label: "Desejos", to: "/desejos", icon: Gift },
      { type: "item", label: "Lista de Compras", to: "/compras", icon: ShoppingCart },
    ],
  },
];

const OPEN_KEY = "sb:navOpen";
const COL_KEY = "sb:collapsed";

function flattenLeaves(): NavLeaf[] {
  const leaves: NavLeaf[] = [];
  sections.forEach((sec) => {
    sec.items.forEach((it) => {
      if (it.type === "group") leaves.push(...it.children);
      else leaves.push(it);
    });
  });
  return leaves;
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = React.useRef<HTMLElement | null>(null);
  const { user, signOut } = useAuth();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "";

  const [collapsed, setCollapsed] = React.useState<boolean>(() =>
    typeof window !== "undefined" && localStorage.getItem(COL_KEY) === "1"
  );

  const [open, setOpen] = React.useState<Record<string, boolean>>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(OPEN_KEY) : null;
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  React.useEffect(() => {
    localStorage.setItem(COL_KEY, collapsed ? "1" : "0");
  }, [collapsed]);
  React.useEffect(() => {
    localStorage.setItem(OPEN_KEY, JSON.stringify(open));
  }, [open]);

  React.useEffect(() => {
    const next: Record<string, boolean> = {};
    sections.forEach((sec) => {
      sec.items.forEach((it) => {
        if (it.type === "group") {
          const activeChild = it.children.some((c) => location.pathname.startsWith(c.to));
          if (activeChild) next[it.label] = true;
        }
      });
    });
    setOpen((prev) => ({ ...prev, ...next }));
  }, [location.pathname]);

  React.useEffect(() => {
    const active = navRef.current?.querySelector(".sb-active") as HTMLElement | null;
    active?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [location.pathname, collapsed]);

  React.useEffect(() => {
    const leaves = flattenLeaves();
    const path = location.pathname;
    let best: NavLeaf | null = null;
    for (const leaf of leaves)
      if (path.startsWith(leaf.to) && (!best || leaf.to.length > best.to.length)) best = leaf;
    const label = best?.label ?? "Financeiro do Yago";
    document.title = `${label} — Financeiro do Yago`;
  }, [location.pathname]);

  const handleGroupClick = (group: NavGroup) => {
    if (collapsed) {
      const first = group.children[0];
      if (first) navigate(first.to);
      return;
    }
    setOpen((p) => ({ ...p, [group.label]: !p[group.label] }));
  };

  return (
    <RTooltip.Provider delayDuration={200} skipDelayDuration={200}>
      <aside
        data-collapsed={collapsed ? "true" : "false"}
        className={[
          "sticky top-0 h-screen shrink-0 border-r border-slate-800/60 bg-slate-950/60 backdrop-blur text-slate-200 transition-[width]",
          collapsed ? "w-20" : "w-72",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="m-3 flex items-center rounded-xl sidebar-header p-5 ring-1 ring-white/10">
            <Logo size="lg" />
            {!collapsed && <span className="ml-2 text-xl font-semibold">FY</span>}
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle className="bg-white/20 text-white hover:bg-white/30" />
              <NavLink
                to="/configuracoes"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30"
                title="Configurações"
              >
                <Settings className="h-4 w-4" />
              </NavLink>
              <button
                aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
                title={collapsed ? "Expandir menu" : "Recolher menu"}
                onClick={() => setCollapsed((v) => !v)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30"
              >
                {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <nav ref={navRef} className="flex-1 overflow-y-auto scrollbar-none px-3 py-6">
            {sections.map((section) => (
              <div key={section.label} className="mt-4 first:mt-0">
                {!collapsed && (
                  <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400/70">
                    {section.label}
                  </div>
                )}

                <ul className="space-y-1">
                  {section.items.map((item) => {
                    if (item.type === "group") {
                      const Icon = item.icon;
                      const isOpen = !!open[item.label];

                      const ButtonEl = (
                        <button
                          onClick={() => handleGroupClick(item)}
                          className={[
                            "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-300 hover:bg-emerald-600/10 hover:text-white transition",
                            collapsed ? "justify-center" : "",
                          ].join(" ")}
                          aria-expanded={isOpen}
                          title={collapsed ? item.label : undefined}
                          aria-label={collapsed ? item.label : undefined}
                        >
                          <span className="flex items-center gap-3">
                            {Icon && <Icon className="h-4 w-4 text-slate-400 group-hover:text-white" />}
                            {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                          </span>
                          {!collapsed && (
                            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          )}
                        </button>
                      );

                      return (
                        <li key={item.label}>
                          <div className="relative">
                            {collapsed ? (
                              <RTooltip.Root>
                                <RTooltip.Trigger asChild>{ButtonEl}</RTooltip.Trigger>
                                <RTooltip.Content
                                  side="right"
                                  sideOffset={8}
                                  className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg ring-1 ring-black/20 data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[side=right]:slide-in-from-left-1"
                                >
                                  {item.label}
                                  <RTooltip.Arrow className="fill-slate-900" />
                                </RTooltip.Content>
                              </RTooltip.Root>
                            ) : (
                              ButtonEl
                            )}
                          </div>

                          {!collapsed && isOpen && (
                            <ul className="mt-1 space-y-1 pl-8">
                              {item.children.map((child) => (
                                <li key={child.to}>
                                  <NavLeafLink leaf={child} />
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      );
                    }

                    return (
                      <li key={item.to}>
                        <NavLeafLink leaf={item} collapsed={collapsed} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-emerald-600/10 transition">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">
                    {initials}
                  </div>
                  {!collapsed && (
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">
                        {user?.user_metadata?.full_name || user?.email}
                      </span>
                      <span className="truncate text-xs text-slate-400">{user?.email}</span>
                    </div>
                  )}
                  {!collapsed && <ChevronDown className="ml-auto h-4 w-4 text-slate-400" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-40">
                <DropdownMenuItem onSelect={() => navigate("/perfil")}>Perfil</DropdownMenuItem>
                <DropdownMenuItem onSelect={signOut}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </RTooltip.Provider>
  );
}

function NavLeafLink({ leaf, collapsed }: { leaf: NavLeaf; collapsed?: boolean }) {
  const Icon = leaf.icon;
  const LinkEl = (
    <NavLink
      to={leaf.to}
      title={collapsed ? leaf.label : leaf.title}
      aria-label={collapsed ? leaf.label : undefined}
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
          collapsed ? "justify-center" : "",
          isActive
            ? leaf.to === "/homeoverview"
              ? "sb-active bg-gradient-to-r from-emerald-600/20 to-emerald-400/20 text-emerald-200 ring-2 ring-emerald-400/60"
              : "sb-active bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
            : "text-slate-300 hover:text-white hover:bg-emerald-600/10",
        ].join(" ")
      }
    >
      {Icon ? <Icon className="h-4 w-4 text-slate-400 group-[.sb-active]:text-emerald-300 group-hover:text-white" /> : null}
      {!collapsed && <span>{leaf.label}</span>}
    </NavLink>
  );

  return collapsed ? (
    <RTooltip.Root>
      <RTooltip.Trigger asChild>{LinkEl}</RTooltip.Trigger>
      <RTooltip.Content
        side="right"
        sideOffset={8}
        className="rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg ring-1 ring-black/20 data-[state=delayed-open]:animate-in data-[state=closed]:animate-out data-[side=right]:slide-in-from-left-1"
      >
        {leaf.label}
        <RTooltip.Arrow className="fill-slate-900" />
      </RTooltip.Content>
    </RTooltip.Root>
  ) : (
    LinkEl
  );
}

export default Sidebar;
