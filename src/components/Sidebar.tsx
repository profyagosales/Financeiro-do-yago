import * as React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import * as RTooltip from "@radix-ui/react-tooltip";
import {
  LayoutDashboard, Wallet, CalendarRange, PiggyBank, Landmark, Building2,
  CandlestickChart, Coins, Target, Plane, Gift, ShoppingCart, Settings,
  Bell, ChevronDown, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";

type NavLeaf = { type: "item"; label: string; to: string; icon?: React.ElementType; title?: string; };
type NavGroup = { type: "group"; label: string; icon?: React.ElementType; children: NavLeaf[]; };
type Section = { label: string; items: (NavLeaf | NavGroup)[] };

const sections: Section[] = [
  {
    label: "Geral",
    items: [
      { type: "item", label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      {
        type: "group", label: "Finanças", icon: Wallet,
        children: [
          { type: "item", label: "Resumo", to: "/financas", icon: LayoutDashboard },
          { type: "item", label: "Mensal", to: "/financas/mensal", icon: CalendarRange },
          { type: "item", label: "Anual", to: "/financas/anual", icon: CalendarRange },
          { type: "item", label: "Contas a Vencer", to: "/financas/contas-a-vencer", icon: Bell },
        ],
      },
    ],
  },
  {
    label: "Investimentos",
    items: [
      { type: "item", label: "Resumo", to: "/investimentos", icon: PiggyBank },
      {
        type: "group", label: "Carteira", icon: Landmark,
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
      { type: "item", label: "Metas e Projetos", to: "/metas", icon: Target },
      {
        type: "group", label: "Milhas", icon: Plane,
        children: [
          { type: "item", label: "Livelo", to: "/milhas/livelo", icon: Plane },
          { type: "item", label: "Latam Pass", to: "/milhas/latampass", icon: Plane },
          { type: "item", label: "Azul", to: "/milhas/azul", icon: Plane },
        ],
      },
      { type: "item", label: "Lista de Desejos", to: "/lista-desejos", icon: Gift },
      { type: "item", label: "Lista de Compras", to: "/lista-compras", icon: ShoppingCart },
    ],
  },
  { label: "Sistema", items: [{ type: "item", label: "Configurações", to: "/configuracoes", icon: Settings }] },
];

const OPEN_KEY = "sb:navOpen";
const COL_KEY = "sb:collapsed";

function flattenLeaves(): NavLeaf[] {
  const leaves: NavLeaf[] = [];
  sections.forEach((sec) => {
    sec.items.forEach((it) => { if (it.type === "group") leaves.push(...it.children); else leaves.push(it); });
  });
  return leaves;
}

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const navRef = React.useRef<HTMLElement | null>(null);

  const [collapsed, setCollapsed] = React.useState<boolean>(() =>
    typeof window !== "undefined" && localStorage.getItem(COL_KEY) === "1"
  );

  const [open, setOpen] = React.useState<Record<string, boolean>>(() => {
    try { const raw = typeof window !== "undefined" ? localStorage.getItem(OPEN_KEY) : null; return raw ? JSON.parse(raw) : {}; }
    catch { return {}; }
  });

  React.useEffect(() => { localStorage.setItem(COL_KEY, collapsed ? "1" : "0"); }, [collapsed]);
  React.useEffect(() => { localStorage.setItem(OPEN_KEY, JSON.stringify(open)); }, [open]);

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
    for (const leaf of leaves) if (path.startsWith(leaf.to) && (!best || leaf.to.length > best.to.length)) best = leaf;
    const label = best?.label ?? "Financeiro do Yago";
    document.title = `${label} — Financeiro do Yago`;
  }, [location.pathname]);

  const handleGroupClick = (group: NavGroup) => {
    if (collapsed) { const first = group.children[0]; if (first) navigate(first.to); return; }
    setOpen((p) => ({ ...p, [group.label]: !p[group.label] }));
  };

  return (
    <RTooltip.Provider delayDuration={200} skipDelayDuration={200}>
      <aside
        data-collapsed={collapsed ? "true" : "false"}
        className={[
          "sticky top-0 h-screen shrink-0 border-r border-slate-800 bg-slate-950/95 backdrop-blur text-slate-200 transition-[width]",
          collapsed ? "w-20" : "w-72",
        ].join(" ")}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-800">
          <Logo className="h-7 w-7" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-emerald-400/90">Financeiro</span>
              <span className="text-base font-semibold text-white">do Yago</span>
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <button
              aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
              title={collapsed ? "Expandir menu" : "Recolher menu"}
              onClick={() => setCollapsed((v) => !v)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/5 text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
            <ThemeToggle />
          </div>
        </div>

        <nav ref={navRef} className="px-2 py-3 overflow-y-auto h-[calc(100vh-56px)]">
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
                    const Icon = item.icon ?? Wallet;
                    const isOpen = !!open[item.label];

                    const ButtonEl = (
                      <button
                        onClick={() => handleGroupClick(item)}
                        className={[
                          "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-slate-300 hover:bg:white/5 hover:bg-white/5 hover:text-white transition",
                          collapsed ? "justify-center" : "",
                        ].join(" ")}
                        aria-expanded={isOpen}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-slate-400 group-hover:text-white" />
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
                                side="right" sideOffset={8}
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
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40",
          collapsed ? "justify-center" : "",
          isActive
            ? "sb-active bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30"
            : "text-slate-300 hover:text-white hover:bg-white/5",
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
        side="right" sideOffset={8}
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