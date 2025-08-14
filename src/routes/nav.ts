export interface NavRoute {
  label: string;
  to: string;
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
    { label: 'Desejos', to: '/desejos' },
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
