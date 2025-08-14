import type { Meta, StoryObj } from '@storybook/react-vite';

import DespesasPorCategoriaChart from './DespesasPorCategoriaChart';

const meta: Meta<typeof DespesasPorCategoriaChart> = {
  title: 'Components/Financas/DespesasPorCategoriaChart',
  component: DespesasPorCategoriaChart,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DespesasPorCategoriaChart>;

export const Default: Story = {
  args: {
    data: [
      { categoria: 'Moradia', valor: 800 },
      { categoria: 'Transporte', valor: 300 },
      { categoria: 'Lazer', valor: 200 },
    ],
    onViewDetails: () => alert('detalhes'),
  },
};
