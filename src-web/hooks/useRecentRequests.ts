import { useEffect } from 'react';
import { createGlobalState, useEffectOnce, useLocalStorage } from 'react-use';
import { useActiveRequestId } from './useActiveRequestId';

const useHistoryState = createGlobalState<string[]>([]);

export function useRecentRequests() {
  const [history, setHistory] = useHistoryState();
  const activeRequestId = useActiveRequestId();
  const [lsState, setLSState] = useLocalStorage<string[]>('recent_requests', []);

  useEffect(() => {
    setLSState(history);
  }, [history, setLSState]);

  useEffectOnce(() => {
    if (lsState) {
      setHistory(lsState);
    }
  });

  useEffect(() => {
    setHistory((h: string[]) => {
      if (activeRequestId === null) return h;
      const withoutCurrentRequest = h.filter((id) => id !== activeRequestId);
      return [activeRequestId, ...withoutCurrentRequest];
    });
  }, [activeRequestId, setHistory]);

  return history;
}
