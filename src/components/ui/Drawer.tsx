import React from 'react';

type DrawerProps = {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  title?: string;
};

export function Drawer({ open, onClose, children, title }: DrawerProps) {
  return (
    <div className={`ui-drawer ${open ? 'ui-drawer--open' : ''}`} aria-hidden={!open}>
      <div className="ui-drawer__sheet">
        <header className="ui-drawer__header">
          <h3>{title}</h3>
          <button className="icon-button" aria-label="Close drawer" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="ui-drawer__body">{children}</div>
      </div>
      {open ? <div className="ui-drawer__backdrop" onClick={onClose} /> : null}
    </div>
  );
}

export default Drawer;
