import { useMutation, useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { KeyValue } from '../lib/models';

const DEFAULT_NAMESPACE = 'app';

export function keyValueQueryKey({
  namespace = DEFAULT_NAMESPACE,
  key,
}: {
  namespace?: string;
  key: string | string[];
}) {
  return ['key_value', { namespace, key: buildKey(key) }];
}

export function useKeyValues<T extends string | number | boolean>({
  namespace = DEFAULT_NAMESPACE,
  key,
  initialValue,
}: {
  namespace?: string;
  key: string | string[];
  initialValue: T;
}) {
  const query = useQuery<KeyValue | null>({
    initialData: null,
    queryKey: keyValueQueryKey({ namespace, key }),
    queryFn: async () => invoke('get_key_value', { namespace, key: buildKey(key) }),
  });

  const mutate = useMutation<KeyValue, unknown, T>({
    mutationFn: (value) => {
      return invoke('set_key_value', {
        namespace,
        key: buildKey(key),
        value: JSON.stringify(value),
      });
    },
  });

  let value: T;
  try {
    value = JSON.parse(query.data?.value ?? JSON.stringify(initialValue));
  } catch (e) {
    value = initialValue;
  }
  return {
    value,
    set: (value: T) => mutate.mutate(value),
  };
}

function buildKey(key: string | string[]): string {
  if (typeof key === 'string') return key;
  return key.join('::');
}
