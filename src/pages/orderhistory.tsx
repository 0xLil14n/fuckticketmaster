import Order, { Ticket } from '@/components/order';
import OrderHistoryContainer from '@/components/orderhistorycontainer';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import client from '../../apolloclient';
import { gql, useQuery } from '@apollo/client';

type Ticket2 = {
  ticketId: string;
  quantity: number;
};

type Props = {
  tickets: Ticket2[];
};

const query = gql`
  query Tickets($userId: String!) {
    user(id: $userId) {
      id
      tickets {
        id
        quantity
        ticketId
      }
    }
  }
`;

const OrderHistory: React.FC<Props> = ({ tickets }) => {
  const { data: session } = useSession();
  const { address } = useAccount();
  const { data, loading } = useQuery(query, {
    variables: { userId: address?.toLowerCase() },
  });
  console.log('tiiiickets', data);
  //   const [tickets, setTickets] = useState<any[]>([]);
  const [aggTix, setAggTickets] = useState<Record<string, Ticket[]>>({});
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/orderhistory', {
        method: 'POST',
        body: JSON.stringify({
          address,
        }),
      });
      const tix = await res.json();

      const aggTickets: Record<string, Ticket[]> = (
        tix.tickets as Ticket[]
      ).reduce((acc: Record<string, Ticket[]>, ticket) => {
        if (acc[ticket.ticketId]) {
          acc[ticket.ticketId] = [...acc[ticket.ticketId], ticket];
        } else {
          acc[ticket.ticketId] = [ticket];
        }
        return acc;
      }, {});

      setAggTickets(aggTickets);

      Object.entries(aggTickets).map((k, v) => console.log('mapppp', k, v));
    })();
  }, [address]);
  if (!session) {
    return <>Please log in</>;
  }
  if (loading) {
    return <div>loading</div>;
  }
  return (
    <div style={{ height: '100%' }}>
      order history
      <OrderHistoryContainer>
        {/* {Object.entries(aggTix).map(([k, v]) => {
          return <Order id={k} tickets={v} key={k} />;
        })} */}
        {(data?.user?.tickets as Ticket2[]).map((t) => (
          <Order id={t.ticketId} quantity={t.quantity} />
        ))}
      </OrderHistoryContainer>
    </div>
  );
};

export default OrderHistory;
