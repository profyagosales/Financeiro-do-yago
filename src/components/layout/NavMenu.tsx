import {
  BarChart3, Bitcoin,
  Building2,
  Heart,
  Home,
  Landmark,
  PiggyBank,
  Plane,
  ShoppingCart, Target,
  Wallet2 as Wallet
} from 'lucide-react';
import * as React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import BrandBlock from './BrandBlock';
import { SubNav } from './SubNav';

import { navRoutes, type NavRoute } from '@/routes/nav.tsx';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Home, Wallet2: Wallet, Landmark, Plane, Heart, ShoppingCart, Target, PiggyBank, Building2, BarChart3, Bitcoin
};

export function NavMenu() {
  const location = useLocation();
  const activeTop = React.useMemo<NavRoute | null>(() => {
    const match = (route: NavRoute): boolean => {
      if (location.pathname === route.to) return true;
      if (route.children?.some(c => location.pathname === c.to)) return true;
      if (location.pathname.startsWith(route.to + '/')) return true;
      return false;
    };
    return navRoutes.find(r => match(r)) || null;
  }, [location.pathname]);

  const routeToClrKey = (route: NavRoute | null): string | undefined => {
    if (!route) return undefined;
    const lbl = route.label.toLowerCase();
    if (lbl.startsWith('home')) return 'home';
    if (lbl.startsWith('finan')) return 'financas';
    if (lbl.startsWith('invest')) return 'invest';
    if (lbl.startsWith('milh')) return 'milhas';
    if (lbl.startsWith('desej')) return 'desejos';
    if (lbl.startsWith('merc')) return 'mercado';
    if (lbl.startsWith('meta')) return 'metas';
    return undefined;
  };
  const activeClrKey = routeToClrKey(activeTop);

  return (
    <header data-clr={activeClrKey} className="sticky top-0 z-40 backdrop-blur-xl bg-white/60 dark:bg-slate-900/50 border-b border-white/30 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center gap-6 py-2">
          <BrandBlock />
          <nav aria-label="Principal" className="flex-1">
            <ul className="flex items-center gap-1 justify-start flex-wrap">
              {navRoutes.map(route => {
                const iconVal = route.icon;
                const Icon = typeof iconVal === 'string' ? (iconMap[iconVal] || iconMap.Home) : null;
                const current = location.pathname === route.to || location.pathname.startsWith(route.to + '/') || activeTop?.label === route.label;
                return (
                  <li key={route.label}>
                    <NavLink
                      to={route.to}
                      data-color={route.color}
                      className={({ isActive }) => cn(
                        'group relative inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 will-change-transform backdrop-blur-md',
                        'bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/10 shadow-sm hover:-translate-y-0.5 hover:scale-[1.03]',
                        (isActive || current) && 'ring-1 ring-inset text-text dark:text-text-dark',
                        (isActive || current) && 'bg-[var(--clr-active)]/15 ring-[var(--clr-active)]'
                      )}
                    >
                      {typeof iconVal === 'function' ? iconVal('h-4 w-4') : Icon ? <Icon className="h-4 w-4" /> : null}
                      {route.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
        {activeTop?.children && <SubNav items={activeTop.children} parentLabel={activeTop.label} />}
      </div>
    </header>
  );
}
