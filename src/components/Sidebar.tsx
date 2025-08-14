import * as React from "react";
import { Link, useMatch } from "react-router-dom";

import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import {
  Home,
  Wallet,
  TrendingUp,
  Target,
  Plane,
  ShoppingCart,
  Heart,
  Settings,
  ChevronDown,
} from "@/components/icons";
import { useAuth } from "@/contexts/AuthContext";

export function Sidebar() {
  const { user, signOut } = useAuth();
  const initials = React.useMemo(() => {
    const name: string =
      (user?.user_metadata?.full_name as string | undefined) || user?.email || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) || user?.email || "";

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-white/10 bg-background/60 text-foreground backdrop-blur">
      <div className="mx-3 mt-3 rounded-2xl p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur ring-1 ring-black/5 dark:ring-white/5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8" />
          <div className="text-sm">
            <div className="font-semibold tracking-wide">Financeiro Yago</div>
            <div className="text-muted-foreground text-xs">painel • pessoal</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle aria-label="Alternar tema" />
          <button
            aria-label="Configurações"
            className="rounded-lg p-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-6 px-3">
        <NavItem to="/dashboard" icon={Home} highlight>
          Visão geral
        </NavItem>

        <div>
          <div className="mb-1 px-3 text-xs font-semibold uppercase text-muted-foreground">
            Finanças
          </div>
          <div className="space-y-1">
            <NavItem to="/financas/resumo" icon={Wallet}>
              Resumo
            </NavItem>
            <NavItem to="/financas/mensal" icon={Wallet}>
              Mensal
            </NavItem>
            <NavItem to="/financas/anual" icon={Wallet}>
              Anual
            </NavItem>
          </div>
        </div>

        <div>
          <div className="mb-1 px-3 text-xs font-semibold uppercase text-muted-foreground">
            Investimentos
          </div>
          <div className="space-y-1">
            <NavItem to="/investimentos" icon={TrendingUp}>
              Resumo
            </NavItem>
            <NavItem to="/carteira-renda-fixa" icon={TrendingUp}>
              Renda Fixa
            </NavItem>
            <NavItem to="/carteira-fiis" icon={TrendingUp}>
              FIIs
            </NavItem>
            <NavItem to="/carteira-bolsa" icon={TrendingUp}>
              Bolsa
            </NavItem>
            <NavItem to="/carteira-cripto" icon={TrendingUp}>
              Cripto
            </NavItem>
          </div>
        </div>

        <NavItem to="/metas" icon={Target}>
          Metas & Projetos
        </NavItem>

        <div>
          <NavItem to="/milhas" icon={Plane}>
            Milhas
          </NavItem>
          <div className="mt-1 space-y-1">
            <NavItem to="/milhas/livelo" className="ml-6">
              Livelo
            </NavItem>
            <NavItem to="/milhas/latampass" className="ml-6">
              LatamPass
            </NavItem>
            <NavItem to="/milhas/azul" className="ml-6">
              Azul
            </NavItem>
          </div>
        </div>

        <NavItem to="/compras" icon={ShoppingCart}>
          Lista de compras
        </NavItem>

        <NavItem to="/desejos" icon={Heart}>
          Lista de desejos
        </NavItem>
      </nav>

      <div className="mx-3 mb-3 mt-auto rounded-xl border border-white/10 p-3 bg-background/40 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-emerald-600 text-white grid place-items-center text-sm">
            {initials}
          </div>
          <div className="text-sm">
            <div className="font-medium">{displayName}</div>
            <div className="text-muted-foreground text-xs">online</div>
          </div>
          <div className="ms-auto">
            <DropdownMenu>
              <DropdownMenuTrigger className="rounded-lg p-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50">
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href="/perfil">Perfil</a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>Sair</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  to: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  highlight?: boolean;
  className?: string;
}

function NavItem({ to, icon: Icon, children, highlight, className }: NavItemProps) {
  const isActive = useMatch(to);
  return (
    <Link
      to={to}
      aria-current={isActive ? "page" : undefined}
      className={[
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-foreground transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 hover:bg-background/40 hover:backdrop-blur hover:scale-[1.01]",
        highlight || isActive
          ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 ring-1 ring-emerald-500/30 shadow-sm"
          : "",
        className || "",
      ].join(" ")}
    >
      {Icon && <Icon className="h-5 w-5 opacity-90" />}
      <span className="text-sm">{children}</span>
    </Link>
  );
}

export default Sidebar;
