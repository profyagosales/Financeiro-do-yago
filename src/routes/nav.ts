export interface NavItem {
  label: string;
  to: string;
}

export interface NavRoute extends NavItem {
  variant?: 'pill' | 'ghost';
}

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
      { label: 'Desejos', to: '/desejos' },
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
  { ...dashboardNavItem, variant: 'pill' },
  { label: 'Finanças', to: '/financas/resumo' },
  { label: 'Investimentos', to: '/investimentos/resumo' },
  { label: 'Metas & Projetos', to: '/metas' },
  { label: 'Milhas', to: '/milhas' },
  { label: 'Desejos', to: '/desejos' },
  { label: 'Compras', to: '/compras' },
];

export type { NavGroup as TopNavGroup };
