import { useContractWrite } from 'wagmi';
import styles from './resaleTicket.module.css';
import { ABI, SEPOLIA_ADDR } from '../../contractdetails';
import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';

export type Listing = {
  id: string;
  listedBy: { id: string };
  supplyLeft: number;
  priceInWei: bigint;
  ticketId: bigint;
  isResale: boolean;
};

type Props = {
  listing: Listing;
};

const eventsQuery = gql`
  query Events($ticketId: String) {
    event(id: $ticketId) {
      id
      eventOwner {
        id
      }
      date
      eventName
      venueName
    }
  }
`;

const ResaleTicket: React.FC<Props> = ({ listing }) => {
  const { id, listedBy, supplyLeft, priceInWei, ticketId, isResale } = listing;
  const { data: eventsData, loading: isEventsLoading } = useQuery(eventsQuery, {
    variables: { ticketId },
  });
  console.log('resaleticket', eventsData, ticketId);

  const [qty, setQty] = useState(1);
  const {
    data,
    write: purchaseResale,
    isLoading,
    isSuccess,
  } = useContractWrite({
    address: SEPOLIA_ADDR,
    abi: ABI,
    functionName: 'buyResoldToken',
    args: [listedBy.id, ticketId, qty],
  });

  if (!eventsData) {
    return <div> loading...</div>;
  }
  const { eventName, date, venueName } = eventsData.event;
  return (
    <div className={styles.container}>
      <div className={styles.img} />

      <div className={styles.timeInfo}>
        {isResale && <h4>certified resale*</h4>}
        <h4>listed by: {listedBy.id.slice(0, 10)}</h4>
        <div>
          <h1>{eventName}</h1>
          <h3>{venueName}</h3>
          <b>New York, NY</b>
        </div>
        <Link href={`/browse/${ticketId}`}>see details</Link>
        <button
          onClick={() => {
            purchaseResale?.({ value: priceInWei });
          }}
          className={styles.button}
        >
          {!isLoading ? 'buy ticket' : 'purchasing...'}
        </button>
      </div>
      <div className={styles.artistInfo}>
        <h3>{date}</h3>
      </div>
    </div>
  );
};

export default ResaleTicket;
