import Link from 'next/link';
import styles from './EventListView.module.css';
import { Listing } from './resaleTicket';

type Event = {
  eventName: string;
  date: string;
  venueName: string;
  id: string;
};
const EventListView: React.FC<{ event: Event }> = ({ event }) => {
  const { eventName, date, venueName, id: eventId } = event;

  return (
    <div className={styles.container}>
      <div className={styles.details}>
        <h2>{eventName.toUpperCase()}</h2>
        <p>
          {date} | {venueName}
        </p>
      </div>
      <Link className={styles.linkButton} href={`/browse/${eventId}`}>
        TICKETS
      </Link>
    </div>
  );
};
export default EventListView;
