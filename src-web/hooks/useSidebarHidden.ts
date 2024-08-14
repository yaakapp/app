import { useActiveWorkspace } from './useActiveWorkspace';
import { useKeyValue } from './useKeyValue';

export function useSidebarHidden() {
  const activeWorkspace = useActiveWorkspace();
  const { set, value } = useKeyValue<boolean>({
    namespace: 'no_sync',
    key: ['sidebar_hidden', activeWorkspace?.id ?? 'n/a'],
    fallback: false,
  });

  return [value, set] as const;
}
