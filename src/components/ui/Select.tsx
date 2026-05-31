"use client";
import type { SelectHTMLAttributes } from 'react';
import { useId } from 'react';

type ValidationState = 'default' | 'success' | 'error';

type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  hint?: string;
  validation?: ValidationState;
  options: SelectOption[];
};

export function Select({ label, hint, validation = 'default', options, id, className = '', children, ...rest }: SelectProps) {
  const reactId = useId();
  const selectId = id ?? `select-${reactId}`;
  const classes = ['ui-field', `ui-field--${validation}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {label ? (
        <label className="ui-field__title" htmlFor={selectId}>
          {label}
        </label>
      ) : null}

      <div className="ui-control ui-control--select">
        <select id={selectId} className="ui-select" {...rest}>
          {options.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <span className="ui-control__chevron" aria-hidden="true">
          ▾
        </span>
      </div>

      {hint ? <p className="ui-hint">{hint}</p> : null}
    </div>
  );
}

export default Select;
