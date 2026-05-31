import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from './Avatar';

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: () => (
    <div className="story-stack story-stack--row">
      <Avatar name="Solomon Leek" />
      <Avatar name="Amina Choi" size="sm" />
      <Avatar name="Jay Mensah" size="lg" />
    </div>
  ),
};
