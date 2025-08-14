export interface NavItem {
  label: string;
  to: string;
}

export interface NavRoute extends NavItem {
  variant?: 'pill' | 'ghost';
  /** Optional path prefix used for active route matching */
  match?: string;
}

export type NavGroup = NavRoute[];

export const navGroups: NavGroup[] = [
  [
    { label: 'Visão geral', to: '/dashboard', variant: 'pill' },
    { label: 'Finanças', to: '/financas/resumo', match: '/financas' },
    { label: 'Investimentos', to: '/investimentos/resumo', match: '/investimentos' },
  ],
  [
    { label: 'Metas & Projetos', to: '/metas' },
    { label: 'Milhas', to: '/milhas' },
    { label: 'Desejos', to: '/desejos' }, // wishlist
    { label: 'Compras', to: '/compras' },
  ],
];

export const allNavItems: NavRoute[] = navGroups.flat();

export function getNavItem(path: string): NavRoute | undefined {
  let best: NavRoute | undefined;
  for (const item of allNavItems) {
    const prefix = item.match ?? item.to;
    if (path.startsWith(prefix) && (!best || prefix.length > (best.match ?? best.to).length)) {
      best = item;
    }
  }
  return best;
}

// Backwards compatibility for components importing navRoutes
export const navRoutes = allNavItems;
export const dashboardNavItem: NavItem = {
  label: 'Visão geral',
  to: '/dashboard',
};

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
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
      { label: 'Desejos', to: '/desejos' }, // wishlist
      { label: 'Compras', to: '/compras' },
    ],
  },
];

export function getNavItem(pathname: string): NavItem | null {
  if (pathname.startsWith(dashboardNavItem.to)) return dashboardNavItem;
  for (const group of navGroups) {
    const item = group.items.find((it) => pathname.startsWith(it.to));
    if (item) return item;
  }
  return null;
}

export const navRoutes: NavRoute[] = [
  { label: 'Visão geral', to: '/homeoverview', variant: 'pill' },
  { label: 'Finanças', to: '/financas/resumo' },
  { label: 'Investimentos', to: '/investimentos/resumo' },
  { label: 'Metas & Projetos', to: '/metas' },
  { label: 'Milhas', to: '/milhas' },
  { label: 'Desejos', to: '/desejos' },
  { label: 'Compras', to: '/compras' },
];

export type { NavGroup as TopNavGroup };
