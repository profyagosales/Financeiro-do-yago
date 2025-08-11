import type { Meta, StoryObj } from '@storybook/react-vite';
import { MotionCard } from './MotionCard';

const meta: Meta<typeof MotionCard> = {
  title: 'Components/MotionCard',
  component: MotionCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MotionCard>;

export const Default: Story = {
  args: {
    children: 'Card content',
  },
};
