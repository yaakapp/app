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
  initialValue,
}: {
  namespace?: string;
  key: string | string[];
  initialValue: T;
}) {
  const query = useQuery<T>({
    initialData: initialValue,
    queryKey: keyValueQueryKey({ namespace, key }),
    queryFn: async () => getKeyValue({ namespace, key, fallback: initialValue }),
  });

  const mutate = useMutation<T, unknown, T>({
    mutationFn: (value) => setKeyValue<T>({ namespace, key, value }),
  });

  return {
    value: query.data,
    set: (value: T) => mutate.mutate(value),
  };
}
