import Ticket from '@/components/ticket';
import { useSession } from 'next-auth/react';

const catalog = () => {
  const { data: session } = useSession();
  const ticketIds = ['03a8e6dd-2ddc-4945-b6ae-44fce246cc93'];
  return (
    <div>
      {session && ticketIds.map((id) => <Ticket ticketId={id} key={id} />)}
      {!session && <div>Please sign in </div>}
    </div>
  );
};

export default catalog;
