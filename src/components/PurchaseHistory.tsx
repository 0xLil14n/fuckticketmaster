import Link from 'next/link';
import styles from './PurchaseHistory.module.css';
import useGetEventInfo from '@/hooks/useGetEventInfo';
import React from 'react';

const PurchaseHistory: React.FC<{ ticketIds: string[] }> = ({ ticketIds }) => {
  return (
    <div className={styles.container}>
      <Tabs />
      <PurchaseHistoryListView ticketIds={ticketIds} />
    </div>
  );
};

const PurchaseHistoryListView: React.FC<{ ticketIds: string[] }> = ({
  ticketIds,
}) => {
  return (
    <div className={styles.purchaseHistory}>
      {ticketIds.map((id) => (
        <PurchaseRow eventId={id} />
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
const TicketInfo: React.FC<{ eventId: string }> = ({ eventId }) => {
  const { data, loading } = useGetEventInfo(eventId);
  console.log('event details', data, eventId);
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
  //   const d = Date({ date: day });
  var shortMonthName = new Intl.DateTimeFormat('en-US', { month: 'short' })
    .format;

  const a = new Date(date);
  const month = shortMonthName(a).toUpperCase();
  const day = a.getDate();

  return (
    <div>
      {}
      <h1>{month}</h1>
      <h1>{`${day}${
        day > 3 ? 'th' : day > 2 ? 'rd' : day > 1 ? 'nd' : 'st'
      }`}</h1>
    </div>
  );
};

const Tabs = () => {
  return (
    <div className={styles.tabs}>
      <Tab label="My Tickets" active />
      <Tab label="My Resale Listings" active={false} />
      <Tab label="List Tickets for Resale" active={false} />
    </div>
  );
};
const Tab: React.FC<{ active: boolean; label: string }> = ({
  active,
  label,
}) => {
  return (
    <div>
      <div className={`${styles.tab} ${active ? styles.tabActive : ''}`}>
        {label}
      </div>
    </div>
  );
};
export default PurchaseHistory;
