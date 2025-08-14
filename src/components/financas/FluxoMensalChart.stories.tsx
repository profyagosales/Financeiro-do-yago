import type { Meta, StoryObj } from '@storybook/react-vite';

import FluxoMensalChart from './FluxoMensalChart';

const meta: Meta<typeof FluxoMensalChart> = {
  title: 'Components/Financas/FluxoMensalChart',
  component: FluxoMensalChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FluxoMensalChart>;

export const Default: Story = {
  args: {
    data: [
      { mes: 'Jan', valor: 1000 },
      { mes: 'Fev', valor: 500 },
      { mes: 'Mar', valor: 1500 },
    ],
    onViewDetails: () => alert('detalhes'),
  },
};
