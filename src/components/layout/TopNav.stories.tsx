import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TopNav } from '@/components/layout/TopNav';
import { currentUser } from '@/lib/site';

const meta: Meta<typeof TopNav> = {
  title: 'Layout/TopNav',
  component: TopNav,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof TopNav>;

export const Default: Story = { args: { title: 'Overview', user: currentUser, notificationCount: 0 } };
export const WithNotifications: Story = { args: { title: 'Tasks', user: currentUser, notificationCount: 3 } };
