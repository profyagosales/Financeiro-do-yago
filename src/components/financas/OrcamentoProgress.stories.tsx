import type { Meta, StoryObj } from '@storybook/react-vite';

import OrcamentoProgress from './OrcamentoProgress';

const meta: Meta<typeof OrcamentoProgress> = {
  title: 'Components/Financas/OrcamentoProgress',
  component: OrcamentoProgress,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof OrcamentoProgress>;

export const Default: Story = {
  args: {
    orcamentos: [
      { categoria: 'Alimentação', usado: 400, limite: 600 },
      { categoria: 'Lazer', usado: 150, limite: 300 },
    ],
    onViewDetails: () => alert('detalhes'),
  },
};
