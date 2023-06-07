import { ChangeEvent, HTMLInputTypeAttribute } from 'react';
import styles from './Input.module.css';
import ErrorMessage from './ErrorMessage';
type Props = {
  onChange: (_: ChangeEvent<HTMLInputElement>) => void;
  value: any;
  label: string;
  type?: HTMLInputTypeAttribute;
  hasError?: boolean;
  errorMessage?: string;
};
const Input: React.FC<Props> = ({
  label,
  value,
  type = 'number',
  hasError = false,
  errorMessage,
  onChange,
}) => {
  return (
    <div className={styles.stack}>
      <label className={styles.label}>{label}</label>
      <input
        className={`${styles.input} ${hasError ? styles.error : ''}`}
        onChange={onChange}
        value={value}
        type={type}
        min={0}
      />
      {hasError && (
        <ErrorMessage
          errorMessage={errorMessage ?? 'Please enter a valid input'}
        />
      )}
    </div>
  );
};
export default Input;
