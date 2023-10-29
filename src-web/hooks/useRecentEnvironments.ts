import { useEffect } from 'react';
import { createGlobalState, useEffectOnce, useLocalStorage } from 'react-use';
import { useActiveRequestId } from './useActiveRequestId';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';

const useHistoryState = createGlobalState<string[]>([]);

export function useRecentEnvironments() {
  const activeWorkspaceId = useActiveWorkspaceId();
  const activeEnvironmentId = useActiveEnvironmentId();
  const [history, setHistory] = useHistoryState();
  const [lsState, setLSState] = useLocalStorage<string[]>(
    'recent_environments::' + activeWorkspaceId,
    [],
  );

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
      if (activeEnvironmentId === null) return currentHistory;
      const withoutCurrentEnvironment = currentHistory.filter((id) => id !== activeEnvironmentId);
      return [activeEnvironmentId, ...withoutCurrentEnvironment];
    });
  }, [activeEnvironmentId, setHistory]);

  return history;
}
