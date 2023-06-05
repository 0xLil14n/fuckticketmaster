import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.studio.thegraph.com/query/47478/fuckticketmaster/v0.0.46.7',
  cache: new InMemoryCache(),
});

export default client;
