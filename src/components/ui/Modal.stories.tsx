import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  args: { open: false, onClose: () => {}, title: 'Example modal' },
  render: () => {
    const Example = () => {
      const [open, setOpen] = useState(false);
      return (
        <div className="story-stack">
          <Button onClick={() => setOpen(true)}>Open modal</Button>
          <Modal open={open} onClose={() => setOpen(false)} title="Example modal">
            <p>This is a simple modal body.</p>
          </Modal>
        </div>
      );
    };

    return <Example />;
  },
};
