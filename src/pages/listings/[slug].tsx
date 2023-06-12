import { Listing } from '@/components/resaleTicket';
import { gql, useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import styles from './listings.module.css';
import useGetEventInfo from '@/hooks/useGetEventInfo';
import useGetPriceInUsd from '@/hooks/useGetPriceInUsd';
import { TicketInfo } from '@/components/PurchaseHistory/PurchaseHistoryListView';

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

const total = 11_429;
const resale = 2_010;
const tickets = 224;

const toCurrency = (x: number) =>
  x.toLocaleString('en-US', {
    currency: 'USD',
    style: 'currency',
    minimumFractionDigits: 0,
  });

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
      <h1>dashboard</h1>
      <div className={styles.metriccontainer}>
        <Metric value={toCurrency(total)} label="in total sales" />
        <Metric value={toCurrency(resale)} label="in resale profit" />
        <Metric value={tickets.toString()} label="total tickets sold" />
      </div>
      <Listings listings={saleListings} />
      <Listings listings={resaleListings} isResale />
    </div>
  );
};

const Metric: React.FC<{ value: string; label: string }> = ({
  value,
  label,
}) => {
  return (
    <section className={styles.box}>
      <h2 className={styles.metricvalue}>{value}</h2>
      <div className={styles.metriclabel}>{label}</div>
    </section>
  );
};

const Listings: React.FC<{ listings: Listing[]; isResale?: boolean }> = ({
  listings,
  isResale = false,
}) => {
  return listings.length > 0 ? (
    <div>
      <h1 className={styles.listingtitle}>
        my {isResale ? 'resale ' : ''}listings
      </h1>
      <div className={styles.listingcontainer}>
        {listings.map((l: Listing) => (
          <ListingRow key={l.id} listing={l} />
        ))}
      </div>
    </div>
  ) : null;
};

const ListingRow: React.FC<{ listing: Listing }> = ({ listing }) => {
  const { data } = useGetEventInfo(listing.ticketId.toString());
  const toUSD = useGetPriceInUsd();

  console.log(data);

  if (!data) {
    return null;
  }

  return (
    <>
      <section className={styles.listing}>
        <TicketInfo eventId={listing.ticketId.toString()} />
        <div>
          <div className={styles.count}>{listing.supplyLeft}</div>
          tickets remaining
        </div>
        <div>
          <div className={styles.count}>
            {toCurrency(parseFloat(toUSD(listing.priceInWei)))}
          </div>
          original price
        </div>
      </section>
    </>
  );
};

export default ListingsView;
