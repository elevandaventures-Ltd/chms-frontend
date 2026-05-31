import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from './Checkbox';

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
} satisfies Meta<typeof Checkbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: 'Accept terms',
  },
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Checkbox label="Accept terms" hint="Required before submitting." checked={checked} onChange={(event) => setChecked(event.currentTarget.checked)} />;
  },
};

export const States: Story = {
  args: {
    label: 'Checkbox state',
  },
  render: () => (
    <div className="story-stack">
      <Checkbox label="Default" hint="This is a standard option." defaultChecked />
      <Checkbox label="Success" hint="Valid selection." validation="success" defaultChecked />
      <Checkbox label="Error" hint="Please confirm this option." validation="error" />
    </div>
  ),
};
