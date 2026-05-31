"use client";
import type { TextareaHTMLAttributes } from 'react';
import { useId } from 'react';

type ValidationState = 'default' | 'success' | 'error';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  validation?: ValidationState;
};

export function Textarea({ label, hint, validation = 'default', id, className = '', placeholder, ...rest }: TextareaProps) {
  const reactId = useId();
  const textareaId = id ?? `textarea-${reactId}`;
  const classes = ['ui-field', `ui-field--${validation}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="ui-control ui-control--textarea">
        <textarea
          id={textareaId}
          className={`ui-input ui-textarea ${label ? 'ui-input--floating' : ''}`}
          placeholder={label ? placeholder ?? ' ' : placeholder}
          {...rest}
        />

        {label ? (
          <label className="ui-label ui-label--textarea" htmlFor={textareaId}>
            {label}
          </label>
        ) : null}
      </div>

      {hint ? <p className="ui-hint">{hint}</p> : null}
    </div>
  );
}

export default Textarea;
