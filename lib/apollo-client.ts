import { ApolloClient, HttpLink, InMemoryCache, from } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { logout } from "@/utils/auth";

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

const errorLink = onError(({ error, operation }) => {
  const { skipAuthRedirect } = operation.getContext();
  if (skipAuthRedirect) return;

  const hasUnauthorizedGraphql = CombinedGraphQLErrors.is(error)
    ? error.errors.some(
        (err) => (err.extensions?.statusCode as number | undefined) === 401
      )
    : false;

  const networkStatus =
    (error as { statusCode?: number })?.statusCode ??
    (error as { status?: number })?.status ??
    (error as { response?: { status?: number } })?.response?.status;
  const hasUnauthorizedNetwork = networkStatus === 401;

  if (hasUnauthorizedGraphql || hasUnauthorizedNetwork) {
    logout();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
});

// 3️⃣ Final Apollo Client
const client = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]),
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
