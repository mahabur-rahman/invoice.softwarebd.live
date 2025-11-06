import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const createClient = () => {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

  if (!endpoint) {
    throw new Error(
      "NEXT_PUBLIC_GRAPHQL_ENDPOINT is not defined. Set it in your environment to enable GraphQL calls."
    );
  }

  return new ApolloClient({
    link: new HttpLink({
      uri: endpoint,
      fetchOptions: { mode: "cors" },
    }),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: { fetchPolicy: "cache-and-network" },
      query: { fetchPolicy: "network-only" },
      mutate: { errorPolicy: "all" },
    },
  });
};

const client = createClient();

export default client;
