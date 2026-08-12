import type { Meta, StoryObj } from '@storybook/react';
import Skeleton from './Skeleton';

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <div className="story-stack">
      <Skeleton height={20} />
      <Skeleton height={14} width={200} />
      <Skeleton height={60} radius={12} />
    </div>
  ),
};
