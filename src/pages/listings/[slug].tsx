import { Listing } from '@/components/resaleTicket';
import { gql, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import styles from './listings.module.css';

const listingsQuery = gql`
  query Listings($userId: String!) {
    user(id: $userId) {
      id
      listings {
        id
        priceInWei
        supplyLeft
        ticketId
        isResale
      }
    }
  }
`;
const ListingsView = () => {
  const router = useRouter();
  const userId = `${router.query.slug}`.toLowerCase();
  const { data, loading } = useQuery(listingsQuery, {
    variables: { userId },
  });
  const listings = data?.user?.listings ?? [];
  const resaleListings = (listings as Listing[]).filter((l) => l.isResale);
  const saleListings = (listings as Listing[]).filter((l) => !l.isResale);

  return (
    <div className={styles.container}>
      <div className={styles.summarycontainer}>
        <div className={styles.box}>
          <h1 className={styles.number}>$10,000</h1>
          <p className={styles.p}>total sales </p>
        </div>
        <div className={styles.box}>
          <h1 className={styles.number}>$1,500</h1>
          <p className={styles.p}>total revenue resales </p>
        </div>
        <div className={styles.box}>
          <h1 className={styles.number}>334</h1>
          <p className={styles.p}>tickets sold </p>
        </div>
      </div>
      <Listings listings={saleListings} />
      <Listings listings={resaleListings} isResale />
    </div>
  );
};

const Listings: React.FC<{ listings: Listing[]; isResale?: boolean }> = ({
  listings,
  isResale = false,
}) => {
  return listings.length > 0 ? (
    <div>
      <h1>my {isResale ? 'resale ' : ''}listings</h1>
      {listings.map((l: Listing) => (
        <ListingRow listing={l} />
      ))}
    </div>
  ) : null;
};

const ListingRow: React.FC<{ listing: Listing }> = ({ listing }) => {
  return (
    <section className={styles.listingContainer}>
      <h3>
        ticket: {listing.ticketId.toString()}, supply left: {listing.supplyLeft}
      </h3>
      <h3>price: {listing.priceInWei.toString()}</h3>
    </section>
  );
};

export default ListingsView;
