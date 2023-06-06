import { Ticket } from '@/components/order';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

import PurchaseHistory from '@/components/PurchaseHistory';
import useGetTicketsForUser from '@/hooks/useGetTicketsForUser';

type Ticket2 = {
  ticketId: string;
  quantity: number;
};

type Props = {
  tickets: Ticket2[];
};

const OrderHistory: React.FC<Props> = ({ tickets }) => {
  const { data: session } = useSession();
  const { address } = useAccount();

  const { data, loading } = useGetTicketsForUser(address?.toLowerCase() ?? '');
  const ticketIds = [
    ...(data?.user?.tickets ?? []).reduce(
      (acc: Set<string>, curr: Ticket2) => acc.add(curr.ticketId),
      new Set()
    ),
  ];
  console.log('ticketIds', ticketIds);

  const [aggTix, setAggTickets] = useState<Record<string, Ticket[]>>({});
  useEffect(() => {
    const aggTickets: Record<string, Ticket[]> = (
      data?.user?.tickets ?? []
    ).reduce((acc: Record<string, Ticket[]>, ticket: Ticket) => {
      if (acc[ticket.ticketId]) {
        acc[ticket.ticketId] = [...acc[ticket.ticketId], ticket];
      } else {
        acc[ticket.ticketId] = [ticket];
      }
      return acc;
    }, {});

    setAggTickets(aggTickets);

    Object.entries(aggTickets).map((k, v) => console.log('mapppp', k, v));
  }, [address, data?.user]);
  if (!session) {
    return <>Please log in</>;
  }
  if (loading) {
    return <div>loading</div>;
  }
  return (
    <div style={{ height: '100%', width: '900px' }}>
      {/* <OrderHistoryContainer> */}
      {/* {Object.entries(aggTix).map(([k, v]) => {
          return <Order id={k} quantity={v.length} key={k} />;
        })} */}
      <PurchaseHistory ticketIds={ticketIds} />
      {/* </OrderHistoryContainer> */}
    </div>
  );
};

export default OrderHistory;
