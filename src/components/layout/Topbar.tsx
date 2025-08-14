import { NavLink } from 'react-router-dom';

import AvatarMenu from './AvatarMenu';
import NavItem from './NavItem';
import MobileNavDrawer from './MobileNavDrawer';


import { Logo } from '@/components/Logo';
import { Settings } from '@/components/icons';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { navRoutes } from '@/routes/nav';
import PeriodSelector from '@/components/dashboard/PeriodSelector';

export default function Topbar() {
  return (
    <header className="topbar-glass sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-emerald-600/80 to-teal-600/80 backdrop-blur">
      <div className="mx-auto flex h-16 items-center px-4">
        <NavLink
          to="/homeoverview"
          className="flex items-center text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
        >
          <Logo size="lg" />
          <span className="ml-2 text-xl font-semibold">FY</span>
        </NavLink>
        <MobileNavDrawer />
        <nav className="ml-6 flex items-center gap-2 text-white">
          {navRoutes.map((item) => (
            <NavItem key={item.to} to={item.to} variant={item.variant}>
              {item.label}
            </NavItem>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 text-white">
          <PeriodSelector />
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
    </header>
  );
}
