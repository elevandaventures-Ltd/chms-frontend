import React, { useState, useRef, useEffect } from 'react';

type DropdownItem = {
  label: string;
  onClick?: () => void;
};

type DropdownProps = {
  label: string;
  items: DropdownItem[];
};

export function Dropdown({ label, items }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }

    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  return (
    <div className="ui-dropdown" ref={ref}>
      <button className="ui-button ui-button--secondary" onClick={() => setOpen((s) => !s)}>
        {label}
      </button>

      {open ? (
        <div className="ui-dropdown__menu" role="menu">
          {items.map((it, i) => (
            <button
              key={i}
              className="ui-dropdown__item"
              role="menuitem"
              onClick={() => {
                it.onClick?.();
                setOpen(false);
              }}
            >
              {it.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default Dropdown;
