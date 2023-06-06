import { ChangeEvent } from 'react';
import styles from './NumberInput.module.css';
type Props = {
  onChange: (_: ChangeEvent<HTMLInputElement>) => void;
  value: number;
  label: string;
};
const NumberInput: React.FC<Props> = ({ label, value, onChange }) => {
  return (
    <div className={styles.stack}>
      <label className={styles.label}>{label}</label>

      <input
        className={styles.input}
        onChange={onChange}
        value={value}
        type="number"
        min={0}
      />
    </div>
  );
};
export default NumberInput;
