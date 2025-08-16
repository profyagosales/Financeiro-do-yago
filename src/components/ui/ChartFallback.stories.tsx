import type { Meta, StoryObj } from '@storybook/react';

import { ChartFallback } from './ChartFallback';

const meta: Meta<typeof ChartFallback> = {
  title: 'Feedback/ChartFallback',
  component: ChartFallback,
};
export default meta;

type Story = StoryObj<typeof ChartFallback>;

export const Default: Story = {
  args: { className: 'h-72 w-full' },
};
