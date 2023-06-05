import styles from './PurchaseHistory.module.css';
import React, { useState } from 'react';
import ResaleView from './ResaleView';
import PurchaseHistoryListView from './PurchaseHistory/PurchaseHistoryListView';
type TabsType = 'tickets' | 'listings' | 'resale';

const PurchaseHistory: React.FC<{ ticketIds: string[] }> = ({ ticketIds }) => {
  const [active, setActive] = useState<TabsType>('tickets');
  return (
    <div className={styles.container}>
      <Tabs
        active={active}
        setActive={(a: TabsType) => {
          setActive(a);
        }}
      />
      <div className={styles.pageContainer}>
        {active == 'tickets' && (
          <PurchaseHistoryListView ticketIds={ticketIds} />
        )}
        {active == 'listings' && <div>listings page </div>}
        {active == 'resale' && <ResaleView ticketIds={ticketIds} />}
      </div>
    </div>
  );
};

const Tabs: React.FC<{ active: string; setActive: (_: TabsType) => void }> = ({
  active,
  setActive,
}) => {
  return (
    <div className={styles.tabs}>
      <Tab
        handleClick={() => setActive('tickets')}
        label="My Tickets"
        active={active == 'tickets'}
      />
      <Tab
        handleClick={() => setActive('listings')}
        label="My Resale Listings"
        active={active == 'listings'}
      />
      <Tab
        handleClick={() => setActive('resale')}
        label="List Tickets for Resale"
        active={active == 'resale'}
      />
    </div>
  );
};
const Tab: React.FC<{
  active: boolean;
  label: string;
  handleClick: () => void;
}> = ({ active, label, handleClick }) => {
  return (
    <div
      onClick={handleClick}
      className={`${styles.tab} ${active ? styles.tabActive : ''}`}
    >
      {label}
    </div>
  );
};
export default PurchaseHistory;
