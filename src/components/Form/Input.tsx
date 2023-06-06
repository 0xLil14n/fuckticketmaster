import { ChangeEvent, HTMLInputTypeAttribute } from 'react';
import styles from './Input.module.css';
type Props = {
  onChange: (_: ChangeEvent<HTMLInputElement>) => void;
  value: any;
  label: string;
  type: HTMLInputTypeAttribute;
};
const Input: React.FC<Props> = ({
  label,
  value,
  type = 'number',
  onChange,
}) => {
  return (
    <div className={styles.stack}>
      <label className={styles.label}>{label}</label>
      <input
        className={styles.input}
        onChange={onChange}
        value={value}
        type={type}
        min={0}
      />
    </div>
  );
};
export default Input;
