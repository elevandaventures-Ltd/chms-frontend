import styles from './Field.module.css';

export type RadioOption = { value: string; label: string };

export type RadioGroupProps = {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
};

export function RadioGroup({ name, label, options, value, onChange, error, disabled }: RadioGroupProps) {
  return (
    <fieldset className={styles.field} style={{ border: 'none', padding: 0, margin: 0 }}>
      {label && <legend className={styles.label}>{label}</legend>}
      {options.map((opt) => (
        <label key={opt.value} className={styles.radioRow}>
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange?.(opt.value)}
            disabled={disabled}
            aria-invalid={!!error}
          />
          <span className={styles.radioLabel}>{opt.label}</span>
        </label>
      ))}
      {error && <span className={styles.error} role="alert">{error}</span>}
    </fieldset>
  );
}
