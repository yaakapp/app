import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { buildKeyValueKey, getKeyValue, setKeyValue } from '../lib/keyValueStore';

const DEFAULT_NAMESPACE = 'app';

export function keyValueQueryKey({
  namespace = DEFAULT_NAMESPACE,
  key,
}: {
  namespace?: string;
  key: string | string[];
}) {
  return ['key_value', { namespace, key: buildKeyValueKey(key) }];
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function useKeyValue<T extends Object | null>({
  namespace = DEFAULT_NAMESPACE,
  key,
  fallback,
}: {
  namespace?: string;
  key: string | string[];
  fallback: T;
}) {
  const queryClient = useQueryClient();
  const query = useQuery<T>({
    queryKey: keyValueQueryKey({ namespace, key }),
    queryFn: async () => getKeyValue({ namespace, key, fallback }),
    refetchOnWindowFocus: false,
  });

  const mutate = useMutation<void, unknown, T>({
    mutationFn: (value) => setKeyValue<T>({ namespace, key, value }),
    // k/v should be as fast as possible, so optimistically update the cache
    onMutate: (value) => queryClient.setQueryData<T>(keyValueQueryKey({ namespace, key }), value),
  });

  const set = useCallback(
    async (value: ((v: T) => T) | T) => {
      if (typeof value === 'function') {
        await getKeyValue({ namespace, key, fallback }).then((kv) => {
          const newV = value(kv);
          if (newV === kv) return;
          return mutate.mutateAsync(newV);
        });
      } else {
        // TODO: Make this only update if the value is different. I tried this but it seems query.data
        //  is stale.
        await mutate.mutateAsync(value);
      }
    },
    [fallback, key, mutate, namespace],
  );

  const reset = useCallback(async () => mutate.mutateAsync(fallback), [mutate, fallback]);

  return useMemo(
    () => ({
      value: query.data,
      isLoading: query.isLoading,
      set,
      reset,
    }),
    [query.data, query.isLoading, reset, set],
  );
}
