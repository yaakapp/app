import { useEffect } from 'react';
import { createGlobalState, useEffectOnce, useLocalStorage } from 'react-use';
import { useActiveRequestId } from './useActiveRequestId';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

const useHistoryState = createGlobalState<string[]>([]);

export function useRecentWorkspaces() {
  const activeWorkspaceId = useActiveWorkspaceId();
  const [history, setHistory] = useHistoryState();
  const [lsState, setLSState] = useLocalStorage<string[]>('recent_workspaces', []);

  // Load local storage state on initial render
  useEffectOnce(() => {
    if (lsState) {
      setHistory(lsState);
    }
  });

  // Update local storage state when history changes
  useEffect(() => {
    setLSState(history);
  }, [history, setLSState]);

  // Set history when active request changes
  useEffect(() => {
    setHistory((currentHistory: string[]) => {
      if (activeWorkspaceId === null) return currentHistory;
      const withoutCurrentWorkspace = currentHistory.filter((id) => id !== activeWorkspaceId);
      return [activeWorkspaceId, ...withoutCurrentWorkspace];
    });
  }, [activeWorkspaceId, setHistory]);

  return history;
}
