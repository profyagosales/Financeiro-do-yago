import type { Meta, StoryObj } from '@storybook/react-vite';

import EntradasVsSaidasChart from './EntradasVsSaidasChart';

const meta: Meta<typeof EntradasVsSaidasChart> = {
  title: 'Components/Financas/EntradasVsSaidasChart',
  component: EntradasVsSaidasChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EntradasVsSaidasChart>;

export const Default: Story = {
  args: {
    data: [
      { mes: 'Jan', entradas: 2000, saidas: 1500 },
      { mes: 'Fev', entradas: 1800, saidas: 1900 },
      { mes: 'Mar', entradas: 2200, saidas: 1700 },
    ],
    onViewDetails: () => alert('detalhes'),
  },
};
