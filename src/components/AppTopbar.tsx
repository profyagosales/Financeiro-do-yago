import * as React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import '@/styles/topbar.css';

import AlertsDrawer from './financas/AlertsDrawer';
import { Logo } from './Logo';
import { ThemeToggle } from './ui/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

import { Settings } from '@/components/icons';
import { useAuth } from '@/contexts/AuthContext';

const activeLink = 'nav-pill nav-hover-underline text-emerald-300';
const baseLink = 'nav-pill nav-ghost nav-hover-underline';

export default function AppTopbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '';

  const navGroups = [
    {
      label: 'Finanças',
      items: [
        { label: 'Resumo', to: '/financas/resumo' },
        { label: 'Mensal', to: '/financas/mensal' },
        { label: 'Anual', to: '/financas/anual' },
      ],
    },
    {
      label: 'Investimentos',
      items: [
        { label: 'Resumo', to: '/investimentos/resumo' },
        { label: 'Carteira', to: '/investimentos/carteira' },
        { label: 'Renda Fixa', to: '/investimentos/renda-fixa' },
        { label: 'FIIs', to: '/investimentos/fiis' },
        { label: 'Bolsa', to: '/investimentos/bolsa' },
        { label: 'Cripto', to: '/investimentos/cripto' },
      ],
    },
    {
      label: 'Planejamento',
      items: [
        { label: 'Metas & Projetos', to: '/metas' },
        { label: 'Milhas', to: '/milhas' },
        { label: 'Lista de desejos', to: '/desejos' },
        { label: 'Lista de compras', to: '/compras' },
      ],
    },
  ];

  const isGroupActive = (items: { to: string }[]) =>
    items.some((it) => location.pathname.startsWith(it.to));

  return (
    <header className="topbar-glass">
      <div className="mx-auto flex h-16 items-center px-4">
        <NavLink to="/dashboard" className="flex items-center text-white">
          <Logo size="lg" />
          <span className="ml-2 text-xl font-semibold">FY</span>
        </NavLink>
        <nav className="ml-6 flex items-center gap-2">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive || location.pathname === '/' ? activeLink : baseLink
            }
          >
            Visão geral
          </NavLink>
          {navGroups.map((group) => {
            const active = isGroupActive(group.items);
            return (
              <DropdownMenu key={group.label}>
                <DropdownMenuTrigger asChild>
                  <button className={active ? activeLink : baseLink}>
                    {group.label}
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {group.items.map((it) => (
                    <DropdownMenuItem
                      key={it.to}
                      onSelect={() => navigate(it.to)}
                    >
                      {it.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <AlertsDrawer />
          <ThemeToggle />
          <NavLink
            to="/configuracoes"
            className="nav-pill nav-ghost h-9 w-9 justify-center"
            title="Configurações"
          >
            <Settings className="h-4 w-4" />
          </NavLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="nav-pill nav-ghost px-2 py-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold">
                  {initials}
                </div>
                <div className="hidden md:flex min-w-0 flex-col text-left">
                  <span className="truncate text-sm font-medium">
                    {user?.user_metadata?.full_name || user?.email}
                  </span>
                  <span className="truncate text-xs text-white/80">{user?.email}</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => navigate('/perfil')}>Perfil</DropdownMenuItem>
              <DropdownMenuItem onSelect={signOut}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
