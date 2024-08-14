import { useCallback, useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import { useActiveWorkspace } from './useActiveWorkspace';

export function useSidebarWidth() {
  const activeWorkspace = useActiveWorkspace();
  const [width, setWidth] = useLocalStorage<number>(
    `sidebar_width::${activeWorkspace?.id ?? 'n/a'}`,
    250,
  );
  const resetWidth = useCallback(() => setWidth(250), [setWidth]);
  return useMemo(() => ({ width, setWidth, resetWidth }), [width, setWidth, resetWidth]);
}
