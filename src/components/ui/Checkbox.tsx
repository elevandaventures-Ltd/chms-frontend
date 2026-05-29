import styles from './Field.module.css';

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label: string;
  error?: string;
};

export function Checkbox({ label, error, id, className = '', ...props }: CheckboxProps) {
  return (
    <div className={styles.field}>
      <label className={styles.checkRow}>
        <input
          type="checkbox"
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={className}
          {...props}
        />
        <span className={styles.checkLabel}>{label}</span>
      </label>
      {error && <span id={`${id}-error`} className={styles.error} role="alert">{error}</span>}
    </div>
  );
}
