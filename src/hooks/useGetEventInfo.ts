import { gql, useQuery } from '@apollo/client';

const eventQuery = gql`
  query EventsQuery($eventId: String!) {
    event(id: $eventId) {
      eventName
      date
      venueName
      id
      listings {
        id
        listedBy {
          id
        }
        isResale
        priceInWei
      }
    }
  }
`;
const useGetEventInfo = (eventId: string) => {
  const { data, error, loading } = useQuery(eventQuery, {
    variables: { eventId },
  });
  return { data, error, loading };
};
export default useGetEventInfo;
