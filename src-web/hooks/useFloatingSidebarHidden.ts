import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useKeyValue } from './useKeyValue';

export function useFloatingSidebarHidden() {
  const activeWorkspaceId = useActiveWorkspaceId();
  const { set, value } = useKeyValue<boolean>({
    namespace: 'no_sync',
    key: ['floating_sidebar_hidden', activeWorkspaceId ?? 'n/a'],
    fallback: false,
  });

  return [value, set] as const;
}
