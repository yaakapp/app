import { useMemo } from 'react';
import { NAMESPACE_NO_SYNC } from '../lib/keyValueStore';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useKeyValue } from './useKeyValue';

export function useSidebarHidden() {
  const activeWorkspaceId = useActiveWorkspaceId();
  const { set, value } = useKeyValue<boolean>({
    namespace: NAMESPACE_NO_SYNC,
    key: ['sidebar_hidden', activeWorkspaceId ?? 'n/a'],
    fallback: false,
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
