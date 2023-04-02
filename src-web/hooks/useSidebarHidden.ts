import { useMemo } from 'react';
import { NAMESPACE_NO_SYNC } from '../lib/keyValueStore';
import { useKeyValue } from './useKeyValue';

export function useSidebarHidden() {
  const { set, value } = useKeyValue<boolean>({
    namespace: NAMESPACE_NO_SYNC,
    key: 'sidebar_hidden',
    defaultValue: false,
  });

  return useMemo(() => {
    return {
      show: () => set(false),
      hide: () => set(true),
      toggle: () => set((h) => !h),
      hidden: value,
    };
  }, [set, value]);
}
