import Link from 'next/link';
import styles from './EventListView.module.css';
import { Listing } from './resaleTicket';
import PresaleBadge from './PresaleBadge';

type Event = {
  eventName: string;
  date: string;
  venueName: string;
  id: string;
  presale: Presale;
};

type Presale = {
  startTime: number;
  endTime: number;
  state: number;
};

const EventListView: React.FC<{ event: Event }> = ({ event }) => {
  const { eventName, date, venueName, id: eventId, presale } = event;

  return (
    <div className={styles.container}>
      <div className={styles.details}>
        <h2>{eventName.toUpperCase()}</h2>
        <p>
          {date} | {venueName}
        </p>
        {presale && <PresaleBadge />}
      </div>
      <Link className={styles.linkButton} href={`/browse/${eventId}`}>
        {presale ? 'PRESALE' : 'BUY TICKETS'}
      </Link>
    </div>
  );
};
export default EventListView;
