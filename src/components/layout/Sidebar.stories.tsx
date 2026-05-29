import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Sidebar } from '@/components/layout/Sidebar';
import { currentUser, sidebarItems } from '@/lib/site';

const meta: Meta<typeof Sidebar> = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 300, minHeight: 500 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Manager: Story = { args: { user: currentUser, items: sidebarItems, activeHref: '#overview' } };
export const Admin: Story = { args: { user: { ...currentUser, role: 'admin', title: 'Administrator' }, items: sidebarItems } };
export const Member: Story = { args: { user: { ...currentUser, role: 'member', title: 'Team Member' }, items: sidebarItems } };
