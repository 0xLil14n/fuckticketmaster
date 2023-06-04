import Ticket from '@/components/ticket';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styles from './detailsview.module.css';
import { useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Listing } from '@/components/resaleTicket';
import useGetPriceInUsd from '@/hooks/useGetPriceInUsd';
const DetailsView = () => {
  const router = useRouter();
  const ticketId = parseInt(router.query.slug?.toString() ?? '');
  const { data: session } = useSession();
  if (Number.isNaN(ticketId)) {
    return <div>404 page not found</div>;
  }
  if (!session) {
    return <>Please log in</>;
  }

  return (
    <div className={styles.container}>
      <EventDetailsHeader />
      <RadioRow eventId={ticketId.toString()} />
      <Ticket isResale={false} ticketId={ticketId} />
    </div>
  );
};
export default DetailsView;

const EventDetailsHeader = () => {
  return (
    <div className={styles.eventDetailsContainer}>
      <h1>THE TAYLOR SWIFT ERAS TOUR</h1>
      <h2 className={styles.titleHighlight}>
        Madison Square Garden | New York, NY
      </h2>
      <h2>Friday June 9th @ 7:30pm</h2>
    </div>
  );
};

const eventListingsQuery = gql`
  query EventsQuery($eventId: String!) {
    event(id: $eventId) {
      eventName
      date
      id
      listings {
        id
        listedBy {
          id
        }
        priceInWei
      }
    }
  }
`;

const RadioRow: React.FC<{ eventId: string }> = ({ eventId }) => {
  const { data, loading } = useQuery(eventListingsQuery, {
    variables: { eventId },
  });
  const getPriceInUsd = useGetPriceInUsd();

  const listings = data?.event?.listings ?? [];
  const [checked, setChecked] = useState(
    listings.length > 0 ? listings[0]?.id : 0
  );
  if (listings.length == 0) {
    return <div>no listings found</div>;
  }

  return (
    <div className={styles.width100}>
      {listings.map((l: Listing) => (
        <Radio
          id={l.id}
          key={l.id}
          radioId="asdf"
          label="asdf"
          isChecked={true}
          setChecked={setChecked}
          listedBy={l.listedBy.id}
          price={`$${getPriceInUsd(l.priceInWei)}`}
        />
      ))}
    </div>
  );
};

const Radio: React.FC<{
  radioId: string;
  id: string;
  label: string;
  isChecked: boolean;
  setChecked: (_: string) => void;
  price: string;
  listedBy: string;
}> = ({ id, label, isChecked, setChecked, listedBy, price }) => {
  return (
    <div
      onClick={() => setChecked(id)}
      className={`${styles.radio} ${isChecked ? styles.radioactive : ''}`}
    >
      <input
        className={styles.radiobutton}
        type="radio"
        name={id}
        id={id}
        checked={isChecked}
      />
      <label className={styles.label}>
        <h2>{price}</h2>
        <div>
          <h3 className={styles.titleHighlight}>best for artist</h3>
          <h2>general admission</h2>
          <p>100% of profit goes to the artist</p>
        </div>
        <div>
          <h2>listed by:</h2>
          <p>{listedBy.slice(0, 10)}</p>
        </div>
      </label>
    </div>
  );
};
