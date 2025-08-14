import type { Meta, StoryObj } from '@storybook/react-vite';

import AlertasList from './AlertasList';

const meta: Meta<typeof AlertasList> = {
  title: 'Components/Financas/AlertasList',
  component: AlertasList,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof AlertasList>;

export const Default: Story = {
  args: {
    alertas: [
      { id: '1', mensagem: 'Saldo baixo na conta corrente' },
      { id: '2', mensagem: 'Cartão de crédito próximo do limite' },
    ],
    onViewDetails: () => alert('detalhes'),
  },
};
