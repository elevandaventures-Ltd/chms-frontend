import type { Meta, StoryObj } from '@storybook/react';

import { Textarea } from './Textarea';

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: 'Message',
    hint: 'A few details helps us respond faster.',
    placeholder: 'Write your message…',
  },
};

export const States: Story = {
  render: () => (
    <div className="story-stack">
      <Textarea label="Default" placeholder="Write something" rows={4} />
      <Textarea label="Success" placeholder="Looks good" validation="success" hint="Nice and clear." rows={4} />
      <Textarea label="Error" placeholder="Needs input" validation="error" hint="Please add more context." rows={4} />
    </div>
  ),
};
