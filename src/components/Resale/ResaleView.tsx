import { useState } from 'react';
import styles from './ResaleView.module.css';
import RadioRowView from '../Radio/RadioRowView';

import ResaleSummary from './ResaleSummary';
import useGetEventInfo from '@/hooks/useGetEventInfo';
import { getDayString, longMonthName } from '@/utils/date';
import { useAccount } from 'wagmi';
import useGetTicketsForUser from '@/hooks/useGetTicketsForUser';

const ResaleView: React.FC<{
  ticketIds: string[];
  setResaleSuccess: (_: boolean) => void;
}> = ({ ticketIds, setResaleSuccess }) => {
  const [selectedTicket, setSelectedTicket] = useState(0);
  const [invalidListing, setInvalidListing] = useState(false);
  return (
    <div className={styles.container}>
      <div className={styles.listContainer}>
        {ticketIds.map((ticketId, i) => (
          <RadioRowView
            label={'label'}
            radioId="resaleTicket"
            onClick={() => {
              console.log('in onclick');
              setSelectedTicket(i);
              setInvalidListing(false);
            }}
            isChecked={i == selectedTicket}
          >
            <ResaleEventDetailsView eventId={ticketId} />
          </RadioRowView>
        ))}
      </div>
      <ResaleSummary
        invalidListing={invalidListing}
        setInvalidListing={setInvalidListing}
        setResaleSuccess={setResaleSuccess}
        eventId={ticketIds[selectedTicket]}
      />
    </div>
  );
};
export default ResaleView;

type Ticket = {
  ticketId: string;
};

const ResaleEventDetailsView: React.FC<{ eventId: string }> = ({ eventId }) => {
  const { address } = useAccount();
  const { data: userData, loading: userLoading } = useGetTicketsForUser(
    address?.toLowerCase() ?? '',
    eventId
  );

  const { data, loading } = useGetEventInfo(eventId);
  if (!data || !userData) {
    return null;
  }

  const { tickets } = userData.user;
  const numTickets = tickets.length;

  const { eventName, date: dateString } = data.event;

  const [date, time] = dateString.split(' ');
  const a = new Date(date);
  const month = longMonthName(a).toUpperCase();
  const day = getDayString(a.getDate());

  return (
    <div className={styles.rowContainer}>
      <div className={styles.rowOne}>
        <h2>
          {numTickets} ticket{numTickets > 1 && 's'}
        </h2>
        <p>Available for resale</p>
      </div>
      <div className={styles.rowTwo}>
        <h2>{eventName.toUpperCase()}</h2>
        <p>
          {month} {day}, 2023 | {time}
        </p>
      </div>
    </div>
  );
};
