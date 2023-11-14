import { NAMESPACE_APP } from '../lib/keyValueStore';
import { useKeyValue } from './useKeyValue';

export function useUpdateMode() {
  const kv = useKeyValue<'stable' | 'beta'>({
    namespace: NAMESPACE_APP,
    key: 'update_mode',
    defaultValue: 'stable',
  });

  return [kv.value, kv.set] as const;
}
