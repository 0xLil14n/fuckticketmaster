import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styles from '../detailsview.module.css';
import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Listing } from '@/components/resaleTicket';
import useGetPriceInUsd from '@/hooks/useGetPriceInUsd';
import RadioListings from '@/components/RadioListings';
import EventDetailsHeader from '@/components/EventDetailsHeader';

import PurchaseSummary from '@/components/PurchaseSummary';
import useGetEventInfo from '@/hooks/useGetEventInfo';

const DetailsView = () => {
  const router = useRouter();
  const ticketId = parseInt(router.query.slug?.toString() ?? '');
  const { data: session } = useSession();
  const getPriceInUsd = useGetPriceInUsd();
  const [selectedListingId, setSelectedListingId] = useState('');

  const { data: eventData, loading } = useGetEventInfo(ticketId.toString());
  if (Number.isNaN(ticketId)) {
    return <div>404 page not found</div>;
  }
  if (!session) {
    return <>Please log in</>;
  }
  if (loading) {
    return <div className={styles.container}></div>;
  }
  const listings: Listing[] = eventData?.event?.listings ?? [];
  const sortedListings = [...listings].sort((a: Listing, b: Listing) => {
    return (
      parseFloat(getPriceInUsd(a.priceInWei)) -
      parseFloat(getPriceInUsd(b.priceInWei))
    );
  });
  const selectedListing = sortedListings.find((l) => l.id == selectedListingId);
  const originalListing = sortedListings.find((l) => !l.isResale);
  const originalTicketPriceUsd = getPriceInUsd(
    originalListing?.priceInWei ?? 0
  );

  const price = getPriceInUsd(selectedListing?.priceInWei ?? 0);
  return (
    <div>
      <EventDetailsHeader event={eventData?.event} />
      <div className={styles.container}>
        <h2>on sale now</h2>
        <div className={styles.listingContainer}>
          <div className={styles.first}>
            {sortedListings.length > 0 && (
              <RadioListings
                listings={sortedListings}
                setSelectedListingId={setSelectedListingId}
              />
            )}
          </div>
          <div className={styles.second}>
            {selectedListing && (
              <PurchaseSummary
                priceWei={selectedListing?.priceInWei ?? BigInt(0)}
                priceUsd={`${price}` ?? '0'}
                ticketId={ticketId}
                isResale={Boolean(selectedListing?.isResale)}
                listedById={selectedListing?.listedBy.id ?? ''}
                originalTicketPriceUsd={originalTicketPriceUsd}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DetailsView;
