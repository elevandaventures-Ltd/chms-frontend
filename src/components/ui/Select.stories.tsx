import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Select } from '@/components/ui/Select';

const ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'member', label: 'Member' },
];

const meta: Meta<typeof Select> = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = { args: { id: 'role', label: 'Role', options: ROLES, placeholder: 'Select a role…' } };
export const Valid: Story = { args: { id: 'sv', label: 'Role', options: ROLES, value: 'manager', valid: true } };
export const Invalid: Story = { args: { id: 'si', label: 'Role', options: ROLES, placeholder: 'Select a role…', error: 'Please select a role.' } };
export const Disabled: Story = { args: { id: 'sd', label: 'Role', options: ROLES, value: 'admin', disabled: true } };
