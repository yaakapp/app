import { useQuery } from '@tanstack/react-query';
import type { GraphQLSchema } from 'graphql';
import { buildClientSchema, getIntrospectionQuery } from '../components/core/Editor';
import { minPromiseMillis } from '../lib/minPromiseMillis';
import type { HttpRequest } from '../lib/models';
import { sendEphemeralRequest } from '../lib/sendEphemeralRequest';
import { useDebouncedValue } from './useDebouncedValue';

const introspectionRequestBody = JSON.stringify({
  query: getIntrospectionQuery(),
  operationName: 'IntrospectionQuery',
});

export function useIntrospectGraphQL(baseRequest: HttpRequest) {
  // Debounce the URL because it can change rapidly, and we don't
  // want to send so many requests.
  const request = useDebouncedValue(baseRequest);

  return useQuery<GraphQLSchema, Error>({
    queryKey: ['introspectGraphQL', { url: request.url, method: request.method }],
    refetchInterval: 1000 * 60, // Refetch every minute
    queryFn: async () => {
      const response = await minPromiseMillis(
        sendEphemeralRequest({ ...baseRequest, body: introspectionRequestBody }),
        700,
      );

      if (response.error) {
        return Promise.reject(new Error(response.error));
      }

      if (response.status < 200 || response.status >= 300) {
        return Promise.reject(
          new Error(`Request failed with status ${response.status}.\n\n${response.body}`),
        );
      }

      if (response.body === null) {
        return Promise.reject(new Error('Empty body returned in response'));
      }

      const { data } = JSON.parse(response.body);
      return buildClientSchema(data);
    },
  });
}
