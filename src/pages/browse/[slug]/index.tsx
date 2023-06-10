import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styles from '../detailsview.module.css';
import React, { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Listing } from '@/components/resaleTicket';
import useGetPriceInUsd from '@/hooks/useGetPriceInUsd';
import RadioListings from '@/components/RadioListings';
import EventDetailsHeader from '@/components/EventDetailsHeader';

import PurchaseSummary from '@/components/PurchaseSummary';
import useGetEventInfo from '@/hooks/useGetEventInfo';
import Input from '@/components/Form/Input';
import SubmitButton from '@/components/Form/SubmitButton';
import useSignUpForPresale, {
  useIsSignedUpForPresale,
} from '@/hooks/useSignUpForPresale';
import { useAccount, useContractRead } from 'wagmi';
import { ABI, SEPOLIA_ADDR } from '../../../../contractdetails';

const DetailsView = () => {
  const router = useRouter();
  const ticketId = parseInt(router.query.slug?.toString() ?? '');
  const { data: session } = useSession();
  const getPriceInUsd = useGetPriceInUsd();

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

  return (
    <div>
      <EventDetailsHeader
        isPresale={Boolean(eventData?.event?.presale)}
        event={eventData?.event}
      />
      <div className={styles.container}>
        {!eventData?.event?.presale && <h2>on sale now</h2>}
        <div className={styles.listingContainer}>
          {(!eventData?.event?.presale ||
            eventData?.event?.presale?.state == 2) && (
            <OnSaleView sortedListings={sortedListings} ticketId={ticketId} />
          )}
          {eventData?.event?.presale && eventData.event.presale.state == 0 && (
            <PresaleSignUpView
              startTime={eventData.event.presale.startTime}
              endTime={eventData.event.presale.endTime}
              eventId={eventData?.event.id}
            />
          )}
          {eventData?.event?.presale && eventData.event.presale.state == 1 && (
            <PresaleOpenView
              eventName={eventData.event.eventName}
              eventId={eventData.event.id}
              sortedListings={sortedListings}
              endTime={eventData.event.presale.endTime}
            />
          )}
        </div>
      </div>
    </div>
  );
};
const PresaleOpenView: React.FC<{
  eventId: number;
  sortedListings: Listing[];
  endTime: number;
  eventName: string;
}> = ({ eventId, sortedListings, endTime, eventName }) => {
  const endDate = new Date(endTime * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = new Date(endTime * 1000).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  const { data: isSignedUp } = useIsSignedUpForPresale(eventId);
  console.log('is signed up', isSignedUp);
  return (
    <>
      {Boolean(isSignedUp) ? (
        <OnSaleView sortedListings={sortedListings} ticketId={eventId} />
      ) : (
        <div
          style={{
            // width: '700px',
            display: 'flex',
            gap: '1rem',
            flexDirection: 'column',
          }}
        >
          <h1>Uh oh, looks like you're not in the Presale Queue! </h1>
          <h2>
            Come back{' '}
            <b style={{ color: 'var(--good-green)' }}>
              {endDate} {time}{' '}
            </b>
            for our regular sale.
          </h2>
          <p>
            Presale is only available to those who signed up for the presale
            queue. Must be in presale queue to access sale. If you should be in
            the presale, please check that you're using the same wallet you
            signed up with.
          </p>

          <h2></h2>
        </div>
      )}
    </>
  );
};
const PresaleSignUpView: React.FC<{
  eventId: number;
  startTime: number;
  endTime: number;
}> = ({ eventId, startTime, endTime }) => {
  const { data, addToPresale } = useSignUpForPresale(eventId);
  console.log('start time', startTime);
  const { data: isSignedUp } = useIsSignedUpForPresale(eventId);
  console.log('isSignedUp', isSignedUp);
  const startDate = new Date(startTime * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = new Date(startTime * 1000).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  const { address } = useAccount();
  const { data: reputationData } = useContractRead({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'getReputationScore',
    args: [address],
    onError(error) {
      console.log('error', error);
    },
  });
  const rep = parseInt(reputationData as string);
  console.log('reputation data', parseInt(reputationData as string));
  return (
    <div className={styles.presaleContainer}>
      {Boolean(isSignedUp) && (
        <div
          style={{
            background: 'var(--good-green)',
            padding: '1rem',
            color: 'black',
          }}
        >
          You've already signed up for this presale! Come back {startDate} at{' '}
          {time} for the sale.
        </div>
      )}
      {Boolean(rep < 50) && (
        <div
          style={{
            background: 'var(--good-green)',
            padding: '1rem',
            color: 'black',
          }}
        >
          You're currently ineligible to sign up for presale queues.
        </div>
      )}
      <h1>
        Presale opens {startDate} at {time}
      </h1>
      <p>
        Signing up for the presale will get you early access to purchase
        tickets.
      </p>
      <SubmitButton
        label="sign up for presale"
        isDisabled={Boolean(isSignedUp) || Boolean(rep < 50)}
        handleSubmit={() => addToPresale?.()}
      />
    </div>
  );
};

const OnSaleView: React.FC<{ sortedListings: Listing[]; ticketId: number }> = ({
  sortedListings,
  ticketId,
}) => {
  const getPriceInUsd = useGetPriceInUsd();
  const [selectedListingId, setSelectedListingId] = useState('');
  const selectedListing = sortedListings.find((l) => l.id == selectedListingId);
  const originalListing = sortedListings.find((l) => !l.isResale);
  const originalTicketPriceUsd = getPriceInUsd(
    originalListing?.priceInWei ?? 0
  );

  const price = getPriceInUsd(selectedListing?.priceInWei ?? 0);
  return (
    <>
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
    </>
  );
};

export default DetailsView;
