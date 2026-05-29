import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Input } from '@/components/ui/Input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { id: 'name', label: 'Full name', placeholder: 'Solomon Leek' } };
export const WithHint: Story = { args: { id: 'email', label: 'Email', placeholder: 'you@example.com', hint: 'We will never share your email.' } };
export const Valid: Story = { args: { id: 'valid', label: 'Username', value: 'solomon', valid: true, readOnly: true } };
export const Invalid: Story = { args: { id: 'invalid', label: 'Email', value: 'not-an-email', error: 'Enter a valid email address.' } };
export const Required: Story = { args: { id: 'req', label: 'Password', type: 'password', required: true, placeholder: '••••••••' } };
export const Disabled: Story = { args: { id: 'dis', label: 'Account ID', value: 'ACC-00123', disabled: true } };
