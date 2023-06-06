import styles from './LineItem.module.css';

const LineItem: React.FC<{
  label: string;
  price: string;
  subtract?: boolean;
}> = ({ label, price, subtract = false }) => {
  return (
    <div
      className={`${styles.lineItemContainer} ${subtract ? styles.red : ''} `}
    >
      <p className={styles.lineItemLabel}>{label}</p>
      <p className={`${styles.lineItemLabel} ${subtract ? styles.red : ''}`}>
        {subtract && '-'}${price}
      </p>
    </div>
  );
};
export default LineItem;
