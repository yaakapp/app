import { useKeyValue } from './useKeyValue';

export function useResponseViewMode(requestId?: string): [string | undefined, () => void] {
  const v = useKeyValue<string>({
    namespace: 'app',
    key: ['response_view_mode', requestId ?? 'n/a'],
    defaultValue: 'pretty',
  });

  const toggle = () => {
    v.set(v.value === 'pretty' ? 'raw' : 'pretty');
  };

  return [v.value, toggle];
}
