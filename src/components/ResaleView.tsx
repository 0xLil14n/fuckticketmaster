import { useState } from 'react';
import RadioRow from './RadioRow';
import RadioRowView from './Radio/RadioRowView';

const ResaleView: React.FC<{ ticketIds: string[] }> = ({ ticketIds }) => {
  const [selectedTicketId, setSelectedTicketId] = useState(0);
  return (
    <div>
      <div>
        {ticketIds.map((ticketId, i) => (
          <RadioRowView>taylor swift</RadioRowView>
        ))}
      </div>
    </div>
  );
};
export default ResaleView;
