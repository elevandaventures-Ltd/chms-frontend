"use client";
import type { InputHTMLAttributes, ReactNode } from 'react';
import { useId } from 'react';

type ValidationState = 'default' | 'success' | 'error';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  validation?: ValidationState;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
};

export function Input({
  label,
  hint,
  validation = 'default',
  leadingIcon,
  trailingIcon,
  clearable = false,
  onClear,
  id,
  className = '',
  placeholder,
  ...rest
}: InputProps) {
  const reactId = useId();
  const inputId = id ?? `input-${reactId}`;
  const classes = ['ui-field', `ui-field--${validation}`, className].filter(Boolean).join(' ');
  const showFloatingLabel = Boolean(label);

  return (
    <div className={classes}>
      <div className={`ui-control ${leadingIcon ? 'ui-control--leading' : ''} ${trailingIcon || clearable ? 'ui-control--trailing' : ''}`}>
        {leadingIcon ? <span className="ui-control__icon ui-control__icon--leading">{leadingIcon}</span> : null}

        <input
          id={inputId}
          className={`ui-input ${showFloatingLabel ? 'ui-input--floating' : ''}`}
          placeholder={showFloatingLabel ? placeholder ?? ' ' : placeholder}
          {...rest}
        />

        {label ? (
          <label className="ui-label" htmlFor={inputId}>
            {label}
          </label>
        ) : null}

        {clearable ? (
          <button type="button" className="ui-control__action" onClick={onClear} aria-label="Clear input">
            ×
          </button>
        ) : null}

        {!clearable && trailingIcon ? <span className="ui-control__icon ui-control__icon--trailing">{trailingIcon}</span> : null}
      </div>

      {hint ? <p className="ui-hint">{hint}</p> : null}
    </div>
  );
}

export default Input;
