import { ReactNode, useEffect, useState } from 'react';
import styles from './PurchaseSummary.module.css';
import usePurchaseTicket from '@/hooks/usePurchaseTicket';
import { useWaitForTransaction } from 'wagmi';
import { useRouter } from 'next/router';
import usePurchaseResaleTicket from '@/hooks/usePurchaseResaleTicket';

const PurchaseSummary: React.FC<{
  priceUsd: string;
  priceWei: bigint;
  ticketId: number;
  isResale: boolean;
  listedById: string;
  originalTicketPriceUsd: string;
}> = ({
  priceUsd,
  priceWei,
  ticketId,
  isResale,
  listedById,
  originalTicketPriceUsd,
}) => {
  const { push } = useRouter();

  const [quantity, setQuantity] = useState(2);
  const {
    purchaseTicket,
    isLoading: isPurchaseLoading,
    isError: isPurchaseError,
    isSuccess: isPurchaseStarted,
    data: purchaseData,
  } = usePurchaseTicket(ticketId);
  const {
    purchaseResale,
    isLoading: isResaleLoading,
    isError: isResaleError,
    isSuccess: isResalePurchaseStarted,
    data: resalePurchaseData,
  } = usePurchaseResaleTicket(ticketId);

  const handleSubmit = () => {
    if (isResale) {
      purchaseResale(listedById, quantity, priceWei);
    } else {
      purchaseTicket(quantity, priceWei as bigint);
    }
  };

  const isLoading = isPurchaseLoading || isResaleLoading;
  const txPurchaseLoading = isPurchaseStarted || isResalePurchaseStarted;
  const { isSuccess: isPurchaseTxSuccess } = useWaitForTransaction({
    hash: purchaseData?.hash ?? resalePurchaseData?.hash,
  });

  useEffect(() => {
    if (isPurchaseTxSuccess) {
      push(`/browse/${ticketId}/success`);
    }
  }, [isPurchaseTxSuccess]);

  const buttonLabel = isLoading
    ? 'Waiting for approval'
    : txPurchaseLoading
    ? 'Purchasing...'
    : 'purchase tickets';

  const totalUsd = parseFloat(priceUsd) * (quantity ? quantity : 0);
  const originalCostUsd = parseFloat(originalTicketPriceUsd) * quantity;
  const artistTakehome = (totalUsd - originalCostUsd) / 2; // 50% cut of profit

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
        <h1>${priceUsd} </h1>
        <b>ticket</b>
      </div>
      <PurchaseForm
        qty={quantity}
        setQty={setQuantity}
        handleSubmit={handleSubmit}
        isDisabled={isLoading || isPurchaseStarted}
        buttonLabel={buttonLabel}
      >
        <LineItem
          label={`$${priceUsd} x ${quantity ? quantity : 0} tickets`}
          price={totalUsd.toFixed(2).toString()}
        />
        <div className={styles.line} />
        <LineItem label={`Total`} price={totalUsd.toFixed(2).toString()} />
      </PurchaseForm>
      {isResale && (
        <div className={styles.breakdownContainer}>
          <h3>Cost Breakdown</h3>

          <LineItem
            label={`Resale price x ${quantity}`}
            price={totalUsd.toFixed(2).toString()}
          />
          <LineItem
            subtract
            label={`Original Ticket cost x ${quantity}`}
            price={`${originalCostUsd.toFixed(2)}`}
          />
          <div className={styles.line} />
          <LineItem label="Artist takehome" price={artistTakehome.toFixed(2)} />
          {/* <LineItem label="FTM Resale Fee" price={'7,00'} /> */}
          <LineItem
            label="Reseller takehome"
            price={artistTakehome.toFixed(2)}
          />
        </div>
      )}
    </div>
  );
};
export default PurchaseSummary;

const PurchaseForm: React.FC<{
  qty: number;
  setQty: (_: number) => void;
  handleSubmit: () => void;
  isDisabled: boolean;
  buttonLabel: string;
  children: ReactNode;
}> = ({ qty, setQty, handleSubmit, isDisabled, buttonLabel, children }) => {
  return (
    <div className={`${styles.formContainer} ${styles.stack}`}>
      <div className={styles.stack}>
        <label className={styles.label}>quantity</label>

        <input
          className={styles.input}
          onChange={(e) => {
            setQty(parseInt(e.target.value));
          }}
          value={qty}
          type="number"
          min={0}
        />
      </div>
      {children}
      <button
        type="button"
        disabled={isDisabled}
        onClick={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className={styles.button}
      >
        {buttonLabel}
      </button>
    </div>
  );
};

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
