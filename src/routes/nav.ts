export interface NavItem {
  label: string;
  to: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const dashboardNavItem: NavItem = {
  label: 'Visão geral',
  to: '/dashboard',
};

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
      { label: 'Renda Fixa', to: '/investimentos/renda-fixa' },
      { label: 'FIIs', to: '/investimentos/fiis' },
      { label: 'Bolsa', to: '/investimentos/bolsa' },
      { label: 'Cripto', to: '/investimentos/cripto' },
    ],
  },
];

export const allNavItems: NavItem[] = [
  dashboardNavItem,
  ...navGroups.flatMap((g) => g.items),
];

export function getNavItem(path: string): NavItem | undefined {
  return allNavItems
    .filter((i) => path.startsWith(i.to))
    .sort((a, b) => b.to.length - a.to.length)[0];
}

export default navGroups;
