import styles from './EventDetailsHeader.module.css';
import PresaleBadge from './PresaleBadge';

type EventInfo = {
  eventName: string;
  venueName: string;
  date: string;
};

const EventDetailsHeader: React.FC<{
  event: EventInfo;
  isPresale?: boolean;
}> = ({ event, isPresale }) => {
  if (!event) {
    return null;
  }

  const { eventName, venueName, date } = event;
  return (
    <div>
      {isPresale && <PresaleBadge />}
      <h1>{eventName.toUpperCase()}</h1>
      <h2 className={styles.titleHighlight}>{venueName}</h2>
      <h2>{date}</h2>
    </div>
  );
};

export default EventDetailsHeader;
