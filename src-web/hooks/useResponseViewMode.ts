import { useKeyValue } from './useKeyValue';

export function useResponseViewMode(requestId?: string): [string, () => void] {
  const v = useKeyValue<string>({
    namespace: 'app',
    key: ['response_view_mode', requestId ?? 'n/a'],
    initialValue: 'pretty',
  });

  const toggle = () => {
    v.set(v.value === 'pretty' ? 'raw' : 'pretty');
  };

  return [v.value, toggle];
}
