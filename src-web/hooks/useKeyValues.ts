import { useMutation, useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { KeyValue } from '../lib/models';

export function keyValueQueryKey(namespace: string, key: string) {
  return ['key_value', { namespace, key }];
}

export function useKeyValues(namespace: string, key: string) {
  const query = useQuery<KeyValue | null>({
    initialData: null,
    queryKey: keyValueQueryKey(namespace, key),
    queryFn: async () => invoke('get_key_value', { namespace, key }),
  });

  const mutate = useMutation<KeyValue, unknown, KeyValue['value']>({
    mutationFn: (value) => {
      return invoke('set_key_value', { namespace, key, value });
    },
  });

  return {
    value: query.data?.value ?? null,
    set: (value: KeyValue['value']) => mutate.mutate(value),
  };
}
