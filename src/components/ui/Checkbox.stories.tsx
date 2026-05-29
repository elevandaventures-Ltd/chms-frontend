import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Checkbox } from '@/components/ui/Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = { args: { id: 'cb1', label: 'I agree to the terms' } };
export const Checked: Story = { args: { id: 'cb2', label: 'Send me updates', defaultChecked: true } };
export const Invalid: Story = { args: { id: 'cb3', label: 'I agree to the terms', error: 'You must accept the terms.' } };
export const Disabled: Story = { args: { id: 'cb4', label: 'Notifications (unavailable)', disabled: true } };
