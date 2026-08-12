"use client";
import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';

type ValidationState = 'default' | 'success' | 'error';

type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  hint?: string;
  validation?: ValidationState;
};

export function Radio({ label, hint, validation = 'default', id, className = '', ...rest }: RadioProps) {
  const reactId = useId();
  const radioId = id ?? `radio-${reactId}`;
  const classes = ['ui-field', `ui-field--${validation}`, className].filter(Boolean).join(' ');

  return (
    <label className={classes} htmlFor={radioId}>
      <span className="ui-check ui-check--radio">
        <input id={radioId} className="sr-only ui-check__input" type="radio" {...rest} />
        <span className="ui-check__box ui-check__box--radio" aria-hidden="true">
          <span className="ui-check__dot" />
        </span>
      </span>

      <span className="ui-field__copy">
        <span className="ui-field__title">{label}</span>
        {hint ? <span className="ui-hint">{hint}</span> : null}
      </span>
    </label>
  );
}

export default Radio;
