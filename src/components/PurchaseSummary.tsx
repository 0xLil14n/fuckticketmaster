import { ReactNode, useEffect, useState } from 'react';
import styles from './PurchaseSummary.module.css';
import usePurchaseTicket from '@/hooks/usePurchaseTicket';
import { useWaitForTransaction } from 'wagmi';
import { useRouter } from 'next/router';
import usePurchaseResaleTicket from '@/hooks/usePurchaseResaleTicket';
import Input from './Form/Input';
import LineItem from './Form/LineItem';
import SubmitButton from './Form/SubmitButton';

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
    console.log('priceWei', priceWei * (quantity as unknown as bigint));
    if (isResale) {
      purchaseResale(listedById, quantity, priceWei);
    } else {
      purchaseTicket(quantity, priceWei * (quantity as unknown as bigint));
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
      <Input
        onChange={(e) => {
          setQty(parseInt(e.target.value));
        }}
        value={qty}
        label="quantity"
      />
      {children}
      <SubmitButton
        label={buttonLabel}
        handleSubmit={handleSubmit}
        isDisabled={isDisabled}
      />
    </div>
  );
};
