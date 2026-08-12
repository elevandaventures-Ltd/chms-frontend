import type { Meta, StoryObj } from '@storybook/react';

import { Select } from './Select';

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: {
    label: 'Priority',
    hint: 'Default to the lowest reasonable setting.',
    options: [
      { label: 'Select a priority', value: '', disabled: true },
      { label: 'Low', value: 'low' },
      { label: 'Medium', value: 'medium' },
      { label: 'High', value: 'high' },
    ],
    defaultValue: 'medium',
  },
};

export const States: Story = {
  args: {
    label: 'State selector',
    options: [
      { label: 'Choose one', value: '', disabled: true },
      { label: 'One', value: 'one' },
      { label: 'Two', value: 'two' },
    ],
  },
  render: () => (
    <div className="story-stack">
      <Select
        label="Default"
        options={[
          { label: 'Choose one', value: '', disabled: true },
          { label: 'One', value: 'one' },
          { label: 'Two', value: 'two' },
        ]}
      />
      <Select
        label="Success"
        validation="success"
        hint="Selected value is valid."
        options={[
          { label: 'One', value: 'one' },
          { label: 'Two', value: 'two' },
        ]}
        defaultValue="one"
      />
      <Select
        label="Error"
        validation="error"
        hint="Please choose a valid option."
        options={[
          { label: 'Choose one', value: '', disabled: true },
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ]}
      />
    </div>
  ),
};
