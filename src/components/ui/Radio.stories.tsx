import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { RadioGroup } from '@/components/ui/Radio';

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = { args: { name: 'priority', label: 'Priority', options: PRIORITIES } };
export const Selected: Story = { args: { name: 'priority2', label: 'Priority', options: PRIORITIES, value: 'medium' } };
export const Invalid: Story = { args: { name: 'priority3', label: 'Priority', options: PRIORITIES, error: 'Please select a priority.' } };
export const Disabled: Story = { args: { name: 'priority4', label: 'Priority', options: PRIORITIES, value: 'low', disabled: true } };
