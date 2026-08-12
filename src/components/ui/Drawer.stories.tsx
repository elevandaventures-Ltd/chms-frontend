import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Drawer } from './Drawer';
import { Button } from './Button';

const meta = {
  title: 'UI/Drawer',
  component: Drawer,
  tags: ['autodocs'],
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { open: false, onClose: () => {}, title: 'Details' },
  render: () => {
    const Example = () => {
      const [open, setOpen] = useState(false);
      return (
        <div className="story-stack">
          <Button onClick={() => setOpen(true)}>Open drawer</Button>
          <Drawer open={open} onClose={() => setOpen(false)} title="Details">
            <p>Drawer content goes here.</p>
          </Drawer>
        </div>
      );
    };

    return <Example />;
  },
};
