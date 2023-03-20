import { useMutation, useQuery } from '@tanstack/react-query';
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

export function useKeyValue<T extends string | number | boolean>({
  namespace = DEFAULT_NAMESPACE,
  key,
  defaultValue,
}: {
  namespace?: string;
  key: string | string[];
  defaultValue: T;
}) {
  const query = useQuery<T>({
    queryKey: keyValueQueryKey({ namespace, key }),
    queryFn: async () => getKeyValue({ namespace, key, fallback: defaultValue }),
  });

  const mutate = useMutation<T, unknown, T>({
    mutationFn: (value) => setKeyValue<T>({ namespace, key, value }),
  });

  return {
    value: query.data,
    isLoading: query.isLoading,
    set: (value: T) => mutate.mutate(value),
  };
}
