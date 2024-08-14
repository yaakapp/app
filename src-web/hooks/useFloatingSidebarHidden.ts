import { useActiveWorkspace } from './useActiveWorkspace';
import { useKeyValue } from './useKeyValue';

export function useFloatingSidebarHidden() {
  const activeWorkspace = useActiveWorkspace();
  const { set, value } = useKeyValue<boolean>({
    namespace: 'no_sync',
    key: ['floating_sidebar_hidden', activeWorkspace?.id ?? 'n/a'],
    fallback: false,
  });

  return [value, set] as const;
}
