import { gql, useQuery } from '@apollo/client';

const query = gql`
  query Tickets($userId: String!) {
    user(id: $userId) {
      id
      tickets {
        id
        ticketId
      }
    }
  }
`;

const queryWithTicketId = gql`
  query Tickets($userId: String!, $ticketId: String!) {
    user(id: $userId) {
      id
      tickets(where: { ticketId: $ticketId }) {
        id
        ticketId
      }
    }
  }
`;
const useGetTicketsForUser = (address: string, ticketId?: string) => {
  const q = ticketId !== undefined ? queryWithTicketId : query;

  const { data, loading, error } = useQuery(q, {
    variables: { userId: address?.toLowerCase(), ticketId },
  });
  return { data, loading, error };
};
export default useGetTicketsForUser;
