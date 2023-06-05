import styles from './EventDetailsHeader.module.css';

type EventInfo = {
  eventName: string;
  venueName: string;
  date: string;
};

const EventDetailsHeader: React.FC<{ event: EventInfo }> = ({ event }) => {
  if (!event) {
    return null;
  }

  const { eventName, venueName, date } = event;
  return (
    <div>
      <h1>{eventName.toUpperCase()}</h1>
      <h2 className={styles.titleHighlight}>{venueName}</h2>
      <h2>{date}</h2>
    </div>
  );
};

export default EventDetailsHeader;
