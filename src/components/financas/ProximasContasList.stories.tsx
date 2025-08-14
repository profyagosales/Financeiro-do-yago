import type { Meta, StoryObj } from '@storybook/react-vite';

import ProximasContasList from './ProximasContasList';

const meta: Meta<typeof ProximasContasList> = {
  title: 'Components/Financas/ProximasContasList',
  component: ProximasContasList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ProximasContasList>;

export const Default: Story = {
  args: {
    contas: [
      { nome: 'Aluguel', vencimento: '2025-06-10', valor: 1200 },
      { nome: 'Internet', vencimento: '2025-06-15', valor: 100 },
    ],
    onViewDetails: () => alert('detalhes'),
  },
};
