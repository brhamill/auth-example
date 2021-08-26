import ReactDOM from 'react-dom';
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { TokenRefreshLink } from 'apollo-link-token-refresh';
import jwtDecode, { JwtPayload } from 'jwt-decode';

import { getAccessToken, setAccessToken } from './accessToken';
import { App } from './App';

const cache = new InMemoryCache({});

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
  credentials: 'include',
});

const authLink = setContext((_, { headers }) => {
  const accessToken = getAccessToken();

  return {
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  console.log(graphQLErrors);
  console.log(networkError);
});

const tokenRefreshLink = new TokenRefreshLink({
  accessTokenField: 'accessToken',
  isTokenValidOrUndefined: () => {
    const token = getAccessToken();

    if (!token) {
      return true;
    }

    try {
      const { exp } = jwtDecode<JwtPayload>(token);

      if (exp && Date.now() >= exp * 1000) {
        return false;
      } else {
        return true;
      }
    } catch (err) {
      return false;
    }
  },
  fetchAccessToken: () => {
    return fetch('http://localhost:4000/refresh_token', {
      method: 'POST',
      credentials: 'include',
    });
  },
  handleFetch: (accessToken: string) => {
    setAccessToken(accessToken);
  },
  handleError: (err: Error) => {
    console.warn('Your refresh token is invalid. Try to relogin');
    console.error(err);
  },
});

const client: ApolloClient<NormalizedCacheObject> = new ApolloClient({
  link: ApolloLink.from([tokenRefreshLink, errorLink, authLink, httpLink]),
  cache,
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
