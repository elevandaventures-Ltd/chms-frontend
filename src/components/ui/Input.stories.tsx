import type { Meta, StoryObj } from '@storybook/react';

import { Input } from './Input';

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: 'Email address',
    hint: 'We will never share your email.',
    placeholder: 'name@company.com',
  },
};

export const States: Story = {
  render: () => (
    <div className="story-stack">
      <Input label="Default" placeholder="Type here" />
      <Input label="Success" placeholder="Verified value" validation="success" hint="Looks good." />
      <Input label="Error" placeholder="Missing value" validation="error" hint="This field is required." />
    </div>
  ),
};

export const WithActions: Story = {
  render: () => <Input label="Search" placeholder="Find a record" clearable hint="Press x to clear." />,
};
