import { NAMESPACE_NO_SYNC } from '../lib/keyValueStore';
import { useKeyValue } from './useKeyValue';

export function useSidebarWidth() {
  return useKeyValue<number>({
    namespace: NAMESPACE_NO_SYNC,
    key: 'sidebar_width',
    defaultValue: 220,
  });
}
