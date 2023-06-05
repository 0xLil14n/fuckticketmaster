import { ReactNode } from 'react';
import styles from './RadioRowView.module.css';

type Props = {
  children: ReactNode;
  isChecked: boolean;
  label: string;
  radioId: string;
  onClick: () => void;
};

const RadioRowView: React.FC<Props> = ({
  isChecked,
  label,
  radioId,
  onClick,
  children,
}) => {
  return (
    <div
      onClick={onClick}
      className={`${styles.radio} ${isChecked ? styles.radioactive : ''}`}
    >
      <input
        className={styles.radiobutton}
        type="radio"
        name={radioId}
        id={label}
        checked={isChecked}
      />
      {children}
    </div>
  );
};
export default RadioRowView;
