import { useEffect, useState } from 'react';
import Input from '../Form/Input';
import styles from './ResaleSummary.module.css';
import LineItem from '../Form/LineItem';
import SubmitButton from '../Form/SubmitButton';
import useGetTicketsForUser from '@/hooks/useGetTicketsForUser';
import { useAccount } from 'wagmi';
import useGetOriginalListing from '@/hooks/useGetOriginalListing';
import useGetPriceInUsd from '@/hooks/useGetPriceInUsd';
import useListForResale from '@/hooks/useListForResale';
import useGetPriceInEth from '@/hooks/useGetPriceInEth';
import ErrorMessage from '../Form/ErrorMessage';

const ResaleSummary: React.FC<{
  eventId: string;
  setResaleSuccess: (_: boolean) => void;
  setInvalidListing: (_: boolean) => void;
  invalidListing: boolean;
}> = ({ eventId, setResaleSuccess, setInvalidListing, invalidListing }) => {
  const [quantity, setQuantity] = useState(0);
  const [quantityError, setQuantityError] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const getPriceInEth = useGetPriceInEth();
  const {
    listForResale,
    data: listForResaleData,
    txSuccess,
    isSuccess,
    isLoading,
    error: listForResaleError,
  } = useListForResale();

  useEffect(() => {
    setQuantityError(false);
    setQuantity(0);
    return () => {
      setQuantityError(false);
      setQuantity(0);
    };
  }, []);

  useEffect(() => {
    if (txSuccess) {
      setResaleSuccess(true);
    }
  }, [txSuccess]);

  const { address } = useAccount();
  const { data: userData, loading: userLoading } = useGetTicketsForUser(
    address?.toLowerCase() ?? '',
    eventId
  );
  const { data, loading, error } = useGetOriginalListing(eventId);
  const [priceUsd, setPriceUsd] = useState(38.5);

  const getPriceInUsd = useGetPriceInUsd();

  if (!data?.event.listings || data?.event.listings.length == 0) {
    return <div className={styles.container}></div>;
  }
  const originalListingPriceInWei = data?.event.listings[0].priceInWei;
  const originalPriceInUsd = getPriceInUsd(
    originalListingPriceInWei ?? BigInt(0)
  );
  const profit = priceUsd - parseFloat(originalPriceInUsd);

  const ticketsAvailable = userData?.user.tickets.length ?? 1;
  const ticketsArr = [...new Array(ticketsAvailable).keys()].map((t) => t + 1);

  const handleSubmit = () => {
    if (quantity == 0) {
      setQuantityError(true);
      return;
    }
    if (!priceUsd) {
      setPriceError(true);
      return;
    }
    const priceInEth = getPriceInEth(priceUsd);
    if (!priceInEth) {
      console.log('no price in eth');
      return;
    }
    listForResale(eventId, priceInEth!, quantity);
    setInvalidListing(
      Boolean(listForResaleError?.message.includes('listing per event'))
    );
  };
  return (
    <div>
      Resale Listing Summary
      <div className={styles.container}>
        <div>
          <label>Number of tickets</label>
          <select
            onChange={(e) => {
              setQuantity(parseInt(e.target.value));
              setQuantityError(false);
            }}
            className={`${styles.dropdown} ${
              quantityError ? styles.error : ''
            }`}
          >
            <option selected={quantity == 0} value={0}>
              -- Select Number of Tickets --
            </option>
            {ticketsArr.map((i) => {
              return (
                <option value={i}>
                  {i} ticket{i > 1 ? 's' : ''}
                </option>
              );
            })}
          </select>

          {quantityError && (
            <ErrorMessage errorMessage="Please enter valid quantity" />
          )}
        </div>
        <ListPriceView
          priceError={priceError}
          setPriceError={(a) => setPriceError(a)}
          setPriceUsd={(a) => setPriceUsd(a)}
          originalPriceInUsd={originalPriceInUsd}
          profit={profit}
          priceUsd={priceUsd}
        />
        <div className={styles.lineItemsContainer}>
          <h2>Resale Summary</h2>
          <LineItem label="Total tickets to list" price={quantity.toString()} />
          <LineItem
            label="Your listing price (per ticket)"
            price={priceUsd.toFixed(2)}
          />
          <LineItem
            label="Total listing value"
            price={(quantity * priceUsd).toFixed(2)}
          />
        </div>
        <SubmitButton
          label={`${
            isLoading
              ? 'Waiting for approval...'
              : isSuccess
              ? 'Purchasing...'
              : 'List Tickets For Resale'
          }`}
          handleSubmit={handleSubmit}
          isDisabled={isLoading || isSuccess || Boolean(invalidListing)}
        />
        {invalidListing && (
          <ErrorMessage errorMessage="You already have a listing for this event." />
        )}
        <Breakdown priceUsd={priceUsd} profit={profit} />
      </div>
    </div>
  );
};

const Breakdown: React.FC<{ priceUsd: number; profit: number }> = ({
  priceUsd,
  profit,
}) => {
  return (
    <div className={styles.lineItemsContainer}>
      <h2>breakdown (per ticket)</h2>
      <LineItem label="Your listing price" price={priceUsd.toFixed(2)} />
      <LineItem label="Artist cut" subtract price={(profit / 2).toFixed(2)} />
      <LineItem label="You take home" price={(profit / 2).toFixed(2)} />
    </div>
  );
};
type ListPriceViewProps = {
  priceError: boolean;
  setPriceError: (_: boolean) => void;
  setPriceUsd: (_: number) => void;
  originalPriceInUsd: string;
  profit: number;
  priceUsd: number;
};
const ListPriceView: React.FC<ListPriceViewProps> = ({
  priceError,
  setPriceError,
  setPriceUsd,
  originalPriceInUsd,
  profit,
  priceUsd,
}) => {
  return (
    <div
      className={`${styles.listPrice}  ${priceError ? styles.priceError : ''}`}
    >
      <Input
        type="number"
        label="List Price (per ticket)"
        value={parseFloat(priceUsd.toFixed(2))}
        onChange={(e) =>
          setPriceUsd(parseFloat(parseFloat(e.target.value).toFixed(2)))
        }
      />
      <div className={styles.p}>
        <p>
          ${profit.toFixed(2)} over the original price ($
          {parseFloat(originalPriceInUsd).toFixed(2)}).
        </p>
        <p
          onClick={() => {
            setPriceUsd(parseFloat(parseFloat(originalPriceInUsd).toFixed(2)));
          }}
          className={styles.reset}
        >
          Reset
        </p>
      </div>
      {priceError && <ErrorMessage errorMessage="Please enter a valid price" />}
    </div>
  );
};

export default ResaleSummary;
