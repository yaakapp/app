import { useEffect } from 'react';
import { createGlobalState, useEffectOnce, useLocalStorage } from 'react-use';
import { useActiveRequestId } from './useActiveRequestId';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

const useHistoryState = createGlobalState<string[]>([]);

export function useRecentRequests() {
  const activeWorkspaceId = useActiveWorkspaceId();
  const activeRequestId = useActiveRequestId();
  const [history, setHistory] = useHistoryState();
  const [lsState, setLSState] = useLocalStorage<string[]>(
    'recent_requests::' + activeWorkspaceId,
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
      if (activeRequestId === null) return currentHistory;
      const withoutCurrentRequest = currentHistory.filter((id) => id !== activeRequestId);
      return [activeRequestId, ...withoutCurrentRequest];
    });
  }, [activeRequestId, setHistory]);

  return history;
}
