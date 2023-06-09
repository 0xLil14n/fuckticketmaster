import useGetEventInfo from '@/hooks/useGetEventInfo';
import Link from 'next/link';
import styles from './PurchaseHistoryListView.module.css';
import { getDayString, shortMonthName } from '@/utils/date';

const PurchaseHistoryListView: React.FC<{ ticketIds: string[] }> = ({
  ticketIds,
}) => {
  return (
    <div className={styles.purchaseHistory}>
      {ticketIds.map((id) => (
        <PurchaseRow key={id} eventId={id} />
      ))}
    </div>
  );
};

const PurchaseRow: React.FC<{ eventId: string }> = ({ eventId }) => {
  return (
    <div className={styles.purchaseRow}>
      <TicketInfo eventId={eventId} />
      <ViewTicketDetails ticketId={eventId} />
    </div>
  );
};
const ViewTicketDetails: React.FC<{ ticketId: string }> = ({ ticketId }) => {
  return (
    <Link href={`/orderhistory/${ticketId}`}>
      <div className={styles.viewTicketDetailsContainer}>
        <div className={styles.arrow}>→</div>
        view ticket details
      </div>
    </Link>
  );
};
export const TicketInfo: React.FC<{ eventId: string }> = ({ eventId }) => {
  const { data, loading } = useGetEventInfo(eventId);

  if (!data) {
    return null;
  }
  const { eventName, venueName, date } = data.event;
  return (
    <div className={styles.row}>
      <DateDetails dateString={date} />
      <EventDetails eventName={eventName} venueName={venueName} />
    </div>
  );
};
const EventDetails: React.FC<{ eventName: string; venueName: string }> = ({
  eventName,
  venueName,
}) => {
  return (
    <div className={styles.stack}>
      <h1>{eventName}</h1>
      <p>{venueName}</p>
      <p>New York, NY</p>
    </div>
  );
};

const DateDetails: React.FC<{ dateString: string }> = ({ dateString }) => {
  const [date, time] = dateString.split(' ');

  const a = new Date(date);
  const month = shortMonthName(a).toUpperCase();
  const day = a.getDate();

  return (
    <div>
      <h1>{month}</h1>
      <h1>{getDayString(day)}</h1>
    </div>
  );
};
export default PurchaseHistoryListView;
