import type { Meta, StoryObj } from '@storybook/react';
import { TrendingDown, TrendingUp, Wallet } from 'lucide-react';

import { AnimatedNumber } from '../ui/AnimatedNumber';

import { KPIStat } from './KPIStat';

const meta: Meta<typeof KPIStat> = {
  title: 'Dashboard/KPIStat',
  component: KPIStat,
  args: {
    label: 'Saldo',
    value: <AnimatedNumber value={12345} />,
    icon: <Wallet size={18} />,
    tone: 'emerald'
  },
};
export default meta;

type Story = StoryObj<typeof KPIStat>;

export const Default = {} as StoryObj<typeof KPIStat>;
export const Entradas = {
  args: {
    label: 'Entradas',
    value: <AnimatedNumber value={8500} />,
    icon: <TrendingUp size={18} />,
    tone: 'blue'
  }
} as StoryObj<typeof KPIStat>;
export const Saidas = {
  args: {
    label: 'Saídas',
    value: <AnimatedNumber value={4300} />,
    icon: <TrendingDown size={18} />,
    tone: 'rose'
  }
} as StoryObj<typeof KPIStat>;

export const Loading = {
  args: {
    label: 'Carregando',
    value: '—',
    icon: <Wallet size={18} />,
    tone: 'slate',
    loading: true
  }
} as StoryObj<typeof KPIStat>;
