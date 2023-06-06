import styles from './SubmitButton.module.css';

type Props = {
  label: string;
  isDisabled: boolean;
  handleSubmit: () => void;
};

const SubmitButton: React.FC<Props> = ({ isDisabled, handleSubmit, label }) => {
  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className={styles.button}
    >
      {label}
    </button>
  );
};
export default SubmitButton;
