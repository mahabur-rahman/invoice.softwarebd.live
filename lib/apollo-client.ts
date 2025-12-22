import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;

if (!endpoint) {
  throw new Error(
    "NEXT_PUBLIC_GRAPHQL_ENDPOINT is not defined. Set it in your environment."
  );
}

// 1️⃣ Auth Link using NEW SetContextLink
const authLink = new SetContextLink((prevContext) => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const token = user?.accessToken;

    return {
      ...prevContext,
      headers: {
        ...prevContext.headers,
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  }

  return prevContext;
});

// 2️⃣ HTTP Link
const httpLink = new HttpLink({
  uri: endpoint,
  fetchOptions: { mode: "cors" },
});

// 3️⃣ Final Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-first",
    },
    query: {
      fetchPolicy: "cache-first",
    },
  }
});

export default client;
