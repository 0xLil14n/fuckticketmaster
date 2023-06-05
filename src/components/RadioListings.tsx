import useGetPriceInUsd from '@/hooks/useGetPriceInUsd';
import RadioRow from './RadioRow';
import { useEffect, useState } from 'react';
import styles from './RadioListings.module.css';

const RadioListings: React.FC<{
  listings: Listing[];
  setSelectedListingId: (_: string) => void;
}> = ({ listings, setSelectedListingId }) => {
  const getPriceInUsd = useGetPriceInUsd();

  useEffect(() => {
    setSelectedListingId(listings.find((l) => !l.isResale).id);
  }, []);

  const [checked, setChecked] = useState(0);
  const handleChecked = (id: number, listingId: string) => {
    setChecked(id);
    setSelectedListingId(listingId);
  };
  return (
    <div className={styles.container}>
      {listings.map((l: Listing, i) => (
        <RadioRow
          id={i}
          listingId={l.id}
          key={i}
          radioId="asdf"
          label="asdf"
          isChecked={i == checked}
          handleChecked={handleChecked}
          listedBy={l.listedBy.id}
          price={`$${getPriceInUsd(l.priceInWei)}`}
        />
      ))}
    </div>
  );
};

export default RadioListings;
