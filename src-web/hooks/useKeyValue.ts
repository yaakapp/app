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
  defaultValue,
}: {
  namespace?: string;
  key: string | string[];
  defaultValue: T;
}) {
  const queryClient = useQueryClient();
  const query = useQuery<T>({
    queryKey: keyValueQueryKey({ namespace, key }),
    queryFn: async () => getKeyValue({ namespace, key, fallback: defaultValue }),
  });

  const mutate = useMutation<void, unknown, T>({
    mutationFn: (value) => setKeyValue<T>({ namespace, key, value }),
    // k/v should be as fast as possible, so optimistically update the cache
    onMutate: (value) => queryClient.setQueryData<T>(keyValueQueryKey({ namespace, key }), value),
  });

  const set = useCallback(
    (value: ((v: T) => T) | T) => {
      if (typeof value === 'function') {
        getKeyValue({ namespace, key, fallback: defaultValue }).then((kv) => {
          mutate.mutate(value(kv));
        });
      } else {
        mutate.mutate(value);
      }
    },
    [defaultValue, key, mutate, namespace],
  );

  const reset = useCallback(() => mutate.mutate(defaultValue), [mutate, defaultValue]);

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
