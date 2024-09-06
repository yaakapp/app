import type { HttpRequest } from '@yaakapp/api';
import type { IntrospectionQuery } from 'graphql';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { buildClientSchema, getIntrospectionQuery } from '../components/core/Editor';
import { minPromiseMillis } from '../lib/minPromiseMillis';
import { getResponseBodyText } from '../lib/responseBody';
import { sendEphemeralRequest } from '../lib/sendEphemeralRequest';
import { useActiveEnvironment } from './useActiveEnvironment';
import { useDebouncedValue } from './useDebouncedValue';
import { useKeyValue } from './useKeyValue';

const introspectionRequestBody = JSON.stringify({
  query: getIntrospectionQuery(),
  operationName: 'IntrospectionQuery',
});

export function useIntrospectGraphQL(baseRequest: HttpRequest) {
  // Debounce the request because it can change rapidly and we don't
  // want to send so too many requests.
  const request = useDebouncedValue(baseRequest);
  const [activeEnvironment] = useActiveEnvironment();
  const [refetchKey, setRefetchKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>();

  const { value: introspection, set: setIntrospection } = useKeyValue<IntrospectionQuery | null>({
    key: ['graphql_introspection', baseRequest.id],
    fallback: null,
    namespace: 'global',
  });

  useEffect(() => {
    const fetchIntrospection = async () => {
      setIsLoading(true);
      setError(undefined);
      const args = {
        ...baseRequest,
        bodyType: 'application/json',
        body: { text: introspectionRequestBody },
      };
      const response = await minPromiseMillis(
        sendEphemeralRequest(args, activeEnvironment?.id ?? null),
        700,
      );

      if (response.error) {
        throw new Error(response.error);
      }

      const bodyText = await getResponseBodyText(response);
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`Request failed with status ${response.status}.\n\n${bodyText}`);
      }

      if (bodyText === null) {
        throw new Error('Empty body returned in response');
      }

      const { data } = JSON.parse(bodyText);
      console.log(`Got introspection response for ${baseRequest.url}`, data);
      await setIntrospection(data);
    };

    fetchIntrospection()
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request.id, request.url, request.method, refetchKey, activeEnvironment?.id]);

  const refetch = useCallback(() => {
    setRefetchKey((k) => k + 1);
  }, []);

  const schema = useMemo(() => {
    try {
      return introspection ? buildClientSchema(introspection) : undefined;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      setError('message' in e ? e.message : String(e));
    }
  }, [introspection]);

  return { schema, isLoading, error, refetch };
}
