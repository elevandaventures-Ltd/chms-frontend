import styles from './Field.module.css';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  hint?: string;
  error?: string;
  valid?: boolean;
};

export function Textarea({ label, hint, error, valid, id, required, className = '', ...props }: TextareaProps) {
  const stateClass = error ? styles.controlInvalid : valid ? styles.controlValid : '';

  return (
    <div className={styles.field}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
          {required && <span className={styles.required} aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={id}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={`${styles.control} ${styles.textarea} ${stateClass} ${className}`}
        {...props}
      />
      {hint && !error && <span id={`${id}-hint`} className={styles.hint}>{hint}</span>}
      {error && <span id={`${id}-error`} className={styles.error} role="alert">{error}</span>}
    </div>
  );
}
