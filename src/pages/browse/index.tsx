import { gql, useQuery } from '@apollo/client';
import { useSession } from 'next-auth/react';
import styles from './catalog.module.css';
import ResaleTicket, { Listing } from '@/components/resaleTicket';
import EventListView from '@/components/EventListView';
import EventListItem from '@/components/EventListItem';

const query = gql`
  query ResaleTickets {
    listings(where: { isResale: false }) {
      id
      isResale
      priceInWei
      supplyLeft
      listedBy {
        id
      }
      ticketId
    }
  }
`;

const Catalog: React.FC = () => {
  const { data: session } = useSession();
  const { data, loading } = useQuery(query, {});

  const listings: Listing[] = data?.listings ?? [];

  return (
    <div className={styles.container}>
      {session &&
        listings.map((listing) => {
          return <EventListItem key={listing.id} listing={listing} />;
        })}
      {!session && <div>Please sign in </div>}
    </div>
  );
};

export default Catalog;
