import type { Meta, StoryObj } from '@storybook/react-vite';

import LancamentosRecentesTable from './LancamentosRecentesTable';

const meta: Meta<typeof LancamentosRecentesTable> = {
  title: 'Components/Financas/LancamentosRecentesTable',
  component: LancamentosRecentesTable,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof LancamentosRecentesTable>;

export const Default: Story = {
  args: {
    lancamentos: [
      { id: '1', descricao: 'Salário', data: '2025-06-01', valor: 3000 },
      { id: '2', descricao: 'Supermercado', data: '2025-06-05', valor: -200 },
    ],
    onViewDetails: () => alert('detalhes'),
  },
};
