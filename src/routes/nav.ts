export interface NavItem {
  label: string;
  to: string;
  icon?: string;
  children?: NavItem[];
}

export interface NavRoute extends NavItem {
  variant?: 'secondary' | 'ghost';
}

export const navRoutes: NavRoute[] = [
  { 
    label: 'Visão geral',
    to: '/dashboard',
    icon: 'Home',
    variant: 'secondary'
  },
  {
    label: 'Finanças',
    to: '/financas',
    icon: 'Wallet',
    children: [
      { label: 'Resumo', to: '/financas/resumo' },
      { label: 'Mensal', to: '/financas/mensal' },
      { label: 'Anual', to: '/financas/anual' }
    ]
  },
  {
    label: 'Investimentos',
    to: '/investimentos',
    icon: 'Landmark',
    children: [
      { label: 'Resumo', to: '/investimentos/resumo' },
      { label: 'Renda Fixa', to: '/investimentos/renda-fixa' },
      { label: 'FIIs', to: '/investimentos/fiis' },
      { label: 'Ações', to: '/investimentos/acoes' },
      { label: 'Cripto', to: '/investimentos/cripto' }
    ]
  },
  {
    label: 'Milhas',
    to: '/milhas',
    icon: 'Plane',
    children: [
      { label: 'Resumo', to: '/milhas/resumo' },
      { label: 'Livelo', to: '/milhas/livelo' },
      { label: 'LATAM Pass', to: '/milhas/latampass' },
      { label: 'Azul', to: '/milhas/azul' }
    ]
  },
  { 
    label: 'Metas',
    to: '/metas',
    icon: 'Target'
  },
  { 
    label: 'Desejos',
    to: '/desejos',
    icon: 'Heart'
  },
  { 
    label: 'Compras',
    to: '/compras',
    icon: 'ShoppingCart'
  }
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
