import { useQuery } from '@tanstack/react-query';
import type { GraphQLSchema } from 'graphql';
import { buildClientSchema, getIntrospectionQuery } from '../components/core/Editor';
import type { HttpRequest } from '../lib/models';
import { sendEphemeralRequest } from '../lib/sendEphemeralRequest';
import { useDebouncedValue } from './useDebouncedValue';

const introspectionRequestBody = JSON.stringify({
  query: getIntrospectionQuery(),
  operationName: 'IntrospectionQuery',
});

export function useIntrospectGraphQL(baseRequest: HttpRequest) {
  const url = useDebouncedValue(baseRequest.url);
  return useQuery<GraphQLSchema, Error>({
    queryKey: ['introspectGraphQL', { url }],
    refetchOnWindowFocus: true,
    // staleTime: 1000 * 60 * 60, // 1 hour
    refetchInterval: 1000 * 60, // Refetch every minute
    queryFn: async () => {
      const response = await sendEphemeralRequest({
        ...baseRequest,
        body: introspectionRequestBody,
      });

      if (response.error) {
        return Promise.reject(new Error(response.error));
      }

      const { data } = JSON.parse(response.body);
      return buildClientSchema(data);
    },
  });
}
