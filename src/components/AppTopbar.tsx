import { NavLink } from 'react-router-dom';
import { Toaster } from 'sonner';

import AvatarMenu from './layout/AvatarMenu';
import NavItem from './layout/NavItem';

import { Logo } from '@/components/Logo';
import { Settings } from '@/components/icons';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { navRoutes, NavRoute } from '@/routes/nav';

function getNavItem(item: NavRoute) {
  return (
    <NavItem key={item.to} to={item.to} variant={item.variant}>
      {item.label}
    </NavItem>
  );
}

export default function AppTopbar() {
  return (
    <header className="topbar-glass sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-emerald-600/80 to-teal-600/80 backdrop-blur">
      <div className="mx-auto flex h-16 items-center px-4">
        <NavLink
          to="/dashboard"
          className="flex items-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
        >
          <Logo size="lg" />
          <span className="ml-2 text-xl font-semibold">FY</span>
        </NavLink>
        <nav className="ml-6 flex items-center gap-2 text-white">
          {navRoutes.map(getNavItem)}
        </nav>
        <div className="ml-auto flex items-center gap-2 text-white">
          <ThemeToggle />
          <NavLink
            to="/configuracoes"
            aria-label="Configurações"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
          >
            <Settings className="h-4 w-4" />
          </NavLink>
          <AvatarMenu />
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </header>
  );
}
