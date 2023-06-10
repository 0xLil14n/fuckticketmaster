import { gql, useQuery } from '@apollo/client';
import EventListView from './EventListView';
import { Listing } from './resaleTicket';

const eventsQuery = gql`
  query Events($ticketId: String) {
    event(id: $ticketId) {
      id
      eventOwner {
        id
      }
      date
      eventName
      venueName
      presale {
        startTime
        endTime
        state
      }
    }
  }
`;

const EventListItem: React.FC<{ listing: Listing }> = ({ listing }) => {
  const { id, listedBy, supplyLeft, priceInWei, ticketId, isResale } = listing;
  const { data: eventsData, loading: isEventsLoading } = useQuery(eventsQuery, {
    variables: { ticketId },
  });
  if (!eventsData?.event) {
    // TODO return skeleton
    return <div> loading...</div>;
  }

  return <EventListView event={eventsData.event} />;
};

export default EventListItem;
