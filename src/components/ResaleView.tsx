import { useState } from 'react';
import styles from './ResaleView.module.css';
import RadioRowView from './Radio/RadioRowView';

const ResaleView: React.FC<{ ticketIds: string[] }> = ({ ticketIds }) => {
  const [selectedTicket, setSelectedTicket] = useState(0);
  return (
    <div className={styles.container}>
      <div className={styles.listContainer}>
        {ticketIds.map((ticketId, i) => (
          <RadioRowView
            label={'label'}
            radioId="resaleTicket"
            onClick={() => setSelectedTicket(i)}
            isChecked={i == selectedTicket}
          >
            <div className={styles.rowContainer}>
              <div>
                <h2>4 tickets</h2>
                <p>Available for resale</p>
              </div>
              <div>
                <h2>TAYLOR SWIFT ERAS TOUR</h2>
                <p>JUNE 10TH, 2023 | 7:30PM</p>
              </div>
            </div>
          </RadioRowView>
        ))}
      </div>
      <ResaleSummary />
    </div>
  );
};
export default ResaleView;

const ResaleSummary = () => {
  return <div>Resale Summary</div>;
};
