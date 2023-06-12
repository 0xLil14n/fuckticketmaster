import useGetPriceInUsd from '@/hooks/useGetPriceInUsd';
import RadioRow from './RadioRow';
import { useEffect, useState } from 'react';
import styles from './RadioListings.module.css';
import { Listing } from './resaleTicket';

const RadioListings: React.FC<{
  listings: Listing[];
  setSelectedListingId: (_: string) => void;
}> = ({ listings, setSelectedListingId }) => {
  const getPriceInUsd = useGetPriceInUsd();

  useEffect(() => {
    setSelectedListingId(listings.find((l) => !l.isResale)?.id ?? '0');
  }, []);

  const [checked, setChecked] = useState(0);
  const handleChecked = (listingId: string) => (id: number) => {
    setChecked(id);
    setSelectedListingId(listingId);
  };
  return (
    <div className={styles.container}>
      {listings.map((l: Listing, i) => (
        <RadioRow
          id={i}
          key={i}
          radioId="asdf"
          label="asdf"
          isChecked={i == checked}
          handleChecked={handleChecked(l.id)}
          listedBy={l.listedBy.id}
          price={`$${getPriceInUsd(l.priceInWei)}`}
        />
      ))}
    </div>
  );
};

export default RadioListings;
