import styles from './ErrorMessage.module.css';

const ErrorMessage: React.FC<{ errorMessage: string }> = ({ errorMessage }) => {
  return <div className={styles.errorBanner}>{errorMessage}</div>;
};
export default ErrorMessage;
