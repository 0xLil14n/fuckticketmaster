import styles from './PurchaseHistory.module.css';
import React, { useState } from 'react';
import ResaleView from './Resale/ResaleView';
import PurchaseHistoryListView from './PurchaseHistory/PurchaseHistoryListView';
import ResaleListingSuccess from './Resale/ResaleListingSuccess';
type TabsType = 'tickets' | 'listings' | 'resale';

const PurchaseHistory: React.FC<{ ticketIds: string[] }> = ({ ticketIds }) => {
  const [active, setActive] = useState<TabsType>('tickets');
  const [resaleSuccess, setResaleSuccess] = useState(false);
  return (
    <div className={styles.container}>
      <Tabs
        active={active}
        resetResaleSuccess={() => setResaleSuccess(false)}
        setActive={(a: TabsType) => {
          setActive(a);
        }}
      />
      <div className={styles.pageContainer}>
        {active == 'tickets' && (
          <PurchaseHistoryListView ticketIds={ticketIds} />
        )}
        {active == 'listings' && <div>listings page </div>}
        {active == 'resale' &&
          (resaleSuccess ? (
            <ResaleListingSuccess />
          ) : (
            <ResaleView
              setResaleSuccess={setResaleSuccess}
              ticketIds={ticketIds}
            />
          ))}
      </div>
    </div>
  );
};

const Tabs: React.FC<{
  active: string;
  setActive: (_: TabsType) => void;
  resetResaleSuccess: () => void;
}> = ({ active, setActive, resetResaleSuccess }) => {
  return (
    <div className={styles.tabs}>
      <Tab
        handleClick={() => {
          setActive('tickets');
          resetResaleSuccess();
        }}
        label="My Tickets"
        active={active == 'tickets'}
      />
      <Tab
        handleClick={() => {
          setActive('listings');
          resetResaleSuccess();
        }}
        label="My Resale Listings"
        active={active == 'listings'}
      />
      <Tab
        handleClick={() => {
          setActive('resale');
          resetResaleSuccess();
        }}
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
