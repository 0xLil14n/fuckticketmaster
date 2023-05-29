import styles from './orderhistorycontainer.module.css';

const OrderHistoryContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className={styles.container}>{children}</div>;
};

export default OrderHistoryContainer;
