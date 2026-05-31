import React from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
};

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="ui-overlay" role="dialog" aria-modal="true">
      <div className="ui-modal">
        <header className="ui-modal__header">
          <h3>{title}</h3>
          <button className="icon-button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="ui-modal__body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
