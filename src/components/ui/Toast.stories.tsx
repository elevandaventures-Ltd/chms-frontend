import type { Meta, StoryObj } from '@storybook/react';
import { Toaster, toast } from 'sonner';
import { Button } from './Button';

const meta = {
  title: 'UI/Toast',
  tags: ['autodocs'],
} satisfies Meta<{}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <div className="story-stack">
      <Toaster position="top-right" />
      <Button onClick={() => toast('Simple message')}>Toast</Button>
      <Button onClick={() => toast.success('Saved successfully')}>Success</Button>
      <Button onClick={() => toast.error('Something went wrong')}>Error</Button>
    </div>
  ),
};
