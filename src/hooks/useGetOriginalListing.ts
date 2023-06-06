import { gql, useQuery } from '@apollo/client';

const listingQuery = gql`
  query ListingQuery($eventId: String!) {
    event(id: $eventId) {
      listings(where: { isResale: false }) {
        id
        priceInWei
      }
    }
  }
`;

const useGetOriginalListing = (eventId: string) => {
  return useQuery(listingQuery, {
    variables: { eventId },
  });
};

export default useGetOriginalListing;
