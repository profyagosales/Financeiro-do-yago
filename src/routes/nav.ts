export interface NavRoute {
  label: string;
  to: string;
  variant?: 'pill' | 'ghost';
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
