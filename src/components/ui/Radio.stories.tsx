import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Radio } from './Radio';

const meta = {
  title: 'UI/Radio',
  component: Radio,
  tags: ['autodocs'],
} satisfies Meta<typeof Radio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: 'Plan A',
  },
  render: () => {
    const [value, setValue] = useState('b');

    return (
      <div className="story-stack">
        <Radio label="Plan A" hint="Best for small teams." checked={value === 'a'} name="plan" value="a" onChange={(event) => setValue(event.currentTarget.value)} />
        <Radio label="Plan B" hint="Best for growth." checked={value === 'b'} name="plan" value="b" onChange={(event) => setValue(event.currentTarget.value)} />
      </div>
    );
  },
};

export const States: Story = {
  args: {
    label: 'Radio state',
  },
  render: () => (
    <div className="story-stack">
      <Radio label="Default" hint="A plain radio choice." name="states" value="default" />
      <Radio label="Success" hint="Looks valid." validation="success" name="states" value="success" defaultChecked />
      <Radio label="Error" hint="Please choose an option." validation="error" name="states" value="error" />
    </div>
  ),
};
