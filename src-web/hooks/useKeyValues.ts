import { useMutation, useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { KeyValue } from '../lib/models';

const DEFAULT_NAMESPACE = 'app';

export function keyValueQueryKey({
  namespace = DEFAULT_NAMESPACE,
  key,
}: {
  namespace: string;
  key: string | string[];
}) {
  return ['key_value', { namespace, key: buildKey(key) }];
}

export function useKeyValues({
  namespace = DEFAULT_NAMESPACE,
  key,
  initialValue,
}: {
  namespace: string;
  key: string | string[];
  initialValue: string;
}) {
  const query = useQuery<KeyValue | null>({
    initialData: null,
    queryKey: keyValueQueryKey({ namespace, key }),
    queryFn: async () => invoke('get_key_value', { namespace, key: buildKey(key) }),
  });

  const mutate = useMutation<KeyValue, unknown, string>({
    mutationFn: (value) => {
      return invoke('set_key_value', { namespace, key: buildKey(key), value });
    },
  });

  return {
    value: query.data?.value ?? initialValue,
    set: (value: string) => mutate.mutate(value),
  };
}

function buildKey(key: string | string[]): string {
  if (typeof key === 'string') return key;
  return key.join('::');
}
