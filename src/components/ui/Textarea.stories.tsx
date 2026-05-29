import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Textarea } from '@/components/ui/Textarea';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = { args: { id: 'notes', label: 'Notes', placeholder: 'Add a note…' } };
export const Valid: Story = { args: { id: 'tv', label: 'Description', value: 'Looks good.', valid: true, readOnly: true } };
export const Invalid: Story = { args: { id: 'ti', label: 'Description', value: '', error: 'Description is required.' } };
export const Disabled: Story = { args: { id: 'td', label: 'Archived notes', value: 'Read only content.', disabled: true } };
