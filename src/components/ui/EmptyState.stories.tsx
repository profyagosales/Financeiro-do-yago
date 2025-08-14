import type { Meta, StoryObj } from '@storybook/react-vite';
import { AlertCircle } from 'lucide-react';

import { EmptyState } from './EmptyState';
import { Button } from './button';

const meta: Meta<typeof EmptyState> = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    icon: <AlertCircle className="h-6 w-6" />,
    title: 'Nothing here',
    message: 'Add something to get started.',
  },
};

export const WithAction: Story = {
  args: {
    icon: <AlertCircle className="h-6 w-6" />,
    title: 'Nothing here',
    message: 'Add something to get started.',
    action: <Button size="sm">Create item</Button>,
  },
};
