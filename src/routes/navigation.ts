import {
    Bitcoin,
    Building2,
    CalendarDays,
    CalendarRange,
    CandlestickChart,
    Heart,
    Landmark,
    LayoutDashboard,
    PieChart,
    Plane,
    ShoppingCart,
    Target,
    TrendingUp,
    WalletCards,
} from 'lucide-react';
import { type ComponentType } from 'react';

export interface NavChild {
  label: string;
  to: string;
  icon?: ComponentType<any>;
}

export interface NavSection {
  label: string;
  to?: string;
  icon: ComponentType<any>;
  children?: NavChild[];
}

export const navSections: NavSection[] = [
  { label: 'Visão geral', to: '/dashboard', icon: LayoutDashboard },
  {
    label: 'Finanças',
    icon: WalletCards,
    children: [
      { label: 'Resumo', to: '/financas/resumo', icon: PieChart },
      { label: 'Mensal', to: '/financas/mensal', icon: CalendarDays },
      { label: 'Anual', to: '/financas/anual', icon: CalendarRange },
    ],
  },
  {
    label: 'Investimentos',
    icon: TrendingUp,
    children: [
      { label: 'Renda Fixa', to: '/investimentos/renda-fixa', icon: Landmark },
      { label: 'FIIs', to: '/investimentos/fiis', icon: Building2 },
      { label: 'Bolsa', to: '/investimentos/bolsa', icon: CandlestickChart },
      { label: 'Cripto', to: '/investimentos/cripto', icon: Bitcoin },
    ],
  },
  { label: 'Metas & Projetos', to: '/metas', icon: Target },
  { label: 'Milhas', to: '/milhas', icon: Plane },
  { label: 'Desejos', to: '/desejos', icon: Heart },
  { label: 'Compras', to: '/compras', icon: ShoppingCart },
];

export const INVESTMENTS_DEFAULT = '/investimentos/renda-fixa';

export function flattenNav(): NavChild[] {
  const out: NavChild[] = [];
  for (const s of navSections) {
    if (s.children) out.push(...s.children);
    else if (s.to) out.push({ label: s.label, to: s.to, icon: s.icon });
  }
  return out;
}
