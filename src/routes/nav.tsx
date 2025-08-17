import * as Lucide from 'lucide-react';
import type { ReactNode } from 'react';

import { APP_COLORS, APP_COLORS_DARK } from '@/theme/colors';

export interface NavItem {
  label: string;
  to: string;
  icon?: string | ((cls?: string) => ReactNode);
  color?: string;
  children?: NavItem[];
}

export interface NavRoute extends NavItem { variant?: 'secondary' | 'ghost'; }

export const navRoutes: NavRoute[] = [
  { label: 'Home', to: '/dashboard', icon: (cls: string = '') => <Lucide.Home className={cls} color={APP_COLORS_DARK.home} />, color: APP_COLORS.home },
  {
    label: 'Finanças',
    to: '/financas/mensal',
    icon: (cls: string = '') => <Lucide.Wallet className={cls} color={APP_COLORS_DARK.financas} />,
    color: APP_COLORS.financas,
    children: [
      { label: 'Mensal',  to: '/financas/mensal', icon: (cls: string = '') => <Lucide.CalendarDays className={cls} color={APP_COLORS_DARK.financas} />, color: 'var(--clr-financas)' },
      { label: 'Anual',   to: '/financas/anual', icon: (cls: string = '') => <Lucide.CalendarCheck className={cls} color={APP_COLORS_DARK.financas} />, color: 'var(--clr-financas)' }
    ]
  },
  {
    label: 'Investimentos',
    to: '/investimentos',
    icon: (cls: string = '') => <Lucide.Landmark className={cls} color={APP_COLORS_DARK.invest} />,
    color: APP_COLORS.invest,
    children: [
      { label: 'Renda Fixa', to: '/investimentos/renda-fixa', icon: (cls: string = '') => <Lucide.PiggyBank className={cls} color={APP_COLORS_DARK.invest} />, color: 'var(--clr-invest)' },
      { label: 'FIIs',       to: '/investimentos/fiis', icon: (cls: string = '') => <Lucide.Building2 className={cls} color={APP_COLORS_DARK.invest} />, color: 'var(--clr-invest)' },
      { label: 'Bolsa',      to: '/investimentos/bolsa', icon: (cls: string = '') => <Lucide.BarChart3 className={cls} color={APP_COLORS_DARK.invest} />, color: 'var(--clr-invest)' },
      { label: 'Cripto',     to: '/investimentos/cripto', icon: (cls: string = '') => <Lucide.Bitcoin className={cls} color={APP_COLORS_DARK.invest} />, color: 'var(--clr-invest)' }
    ]
  },
  {
    label: 'Milhas',
    to: '/milhas',
    icon: (cls: string = '') => <Lucide.Plane className={cls} color={APP_COLORS_DARK.milhas} />,
    color: APP_COLORS.milhas,
    children: [
      { label: 'Livelo',     to: '/milhas/livelo', icon: (cls: string = '') => <Lucide.Plane className={cls} color={APP_COLORS_DARK.milhas} />, color: 'var(--clr-milhas)' },
      { label: 'LATAM Pass', to: '/milhas/latampass', icon: (cls: string = '') => <Lucide.Plane className={cls} color={APP_COLORS_DARK.milhas} />, color: 'var(--clr-milhas)' },
      { label: 'Azul',       to: '/milhas/azul', icon: (cls: string = '') => <Lucide.Plane className={cls} color={APP_COLORS_DARK.milhas} />, color: 'var(--clr-milhas)' }
    ]
  },
  { label: 'Desejos', to: '/desejos', icon: (cls: string = '') => <Lucide.Heart className={cls} color={APP_COLORS_DARK.desejos} />, color: APP_COLORS.desejos },
  { label: 'Mercado', to: '/mercado', icon: (cls: string = '') => <Lucide.ShoppingCart className={cls} color={APP_COLORS_DARK.mercado} />, color: APP_COLORS.mercado },
  { label: 'Metas', to: '/metas', icon: (cls: string = '') => <Lucide.Target className={cls} color={APP_COLORS_DARK.metas} />, color: APP_COLORS.metas }
];

export function getNavItem(pathname: string): NavItem | null {
  for (const route of navRoutes) {
    if (pathname === route.to) return route;
    if (route.children) {
      const child = route.children.find(child => pathname === child.to);
      if (child) return child;
    }
    if (pathname.startsWith(route.to + '/')) return route;
  }
  return null;
}
