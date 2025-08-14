import * as React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Settings } from 'lucide-react';

import { ThemeToggle } from './ui/ThemeToggle';
import AlertsDrawer from './financas/AlertsDrawer';
import { Logo } from './Logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

import { useAuth } from '@/contexts/AuthContext';
import { dashboardNavItem, navGroups, getNavItem } from '@/routes/nav';

const activeLink =
  'text-white font-semibold ring-1 ring-white/30 rounded-lg px-3 py-1 bg-white/10';
const baseLink =
  'text-white/80 hover:text-white px-3 py-1 rounded-lg transition';

export default function AppTopbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '';
  React.useEffect(() => {
    const item = getNavItem(location.pathname);
    const label = item?.label ?? 'Financeiro do Yago';
    document.title = `${label} - Financeiro do Yago`;
  }, [location.pathname]);


  const isGroupActive = (items: { to: string }[]) =>
    items.some((it) => location.pathname.startsWith(it.to));

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600/80 to-teal-600/80 backdrop-blur border-b border-white/10 dark:border-white/10">
      <div className="mx-auto flex h-16 items-center px-4">
        <NavLink to={dashboardNavItem.to} className="flex items-center text-white">
          <Logo size="lg" />
          <span className="ml-2 text-xl font-semibold">FY</span>
        </NavLink>
        <nav className="ml-6 flex items-center gap-2">
          <NavLink
            to={dashboardNavItem.to}
            className={({ isActive }) =>
              isActive || location.pathname === '/' ? activeLink : baseLink
            }
          >
            {dashboardNavItem.label}
          </NavLink>
          {navGroups.map((group) => {
            const active = isGroupActive(group.items);
            return (
              <DropdownMenu key={group.label}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`${active ? activeLink : baseLink} flex items-center gap-1`}
                  >
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white hover:bg-white/20"
            title="Configurações"
          >
            <Settings className="h-4 w-4" />
          </NavLink>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-xl px-2 py-1 text-white hover:bg-white/20">
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
