import { useCallback, useMemo } from 'react';
import { useLocalStorage } from 'react-use';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

export function useSidebarWidth() {
  const activeWorkspaceId = useActiveWorkspaceId();
  const [width, setWidth] = useLocalStorage<number>(`sidebar_width::${activeWorkspaceId}`, 220);
  const resetWidth = useCallback(() => setWidth(220), [setWidth]);
  return useMemo(() => ({ width, setWidth, resetWidth }), [width, setWidth, resetWidth]);
}
