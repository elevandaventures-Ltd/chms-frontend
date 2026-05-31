"use client";
import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';

type ValidationState = 'default' | 'success' | 'error';

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  hint?: string;
  validation?: ValidationState;
};

export function Checkbox({ label, hint, validation = 'default', id, className = '', ...rest }: CheckboxProps) {
  const reactId = useId();
  const checkboxId = id ?? `checkbox-${reactId}`;
  const classes = ['ui-field', `ui-field--${validation}`, className].filter(Boolean).join(' ');

  return (
    <label className={classes} htmlFor={checkboxId}>
      <span className="ui-check">
        <input id={checkboxId} className="sr-only ui-check__input" type="checkbox" {...rest} />
        <span className="ui-check__box" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="ui-check__mark" aria-hidden="true">
            <path d="M5 12.5l4 4 10-10" />
          </svg>
        </span>
      </span>

      <span className="ui-field__copy">
        <span className="ui-field__title">{label}</span>
        {hint ? <span className="ui-hint">{hint}</span> : null}
      </span>
    </label>
  );
}

export default Checkbox;
