import { useEffect, useMemo } from 'react';
import { createGlobalState, useEffectOnce } from 'react-use';
import { getKeyValue, NAMESPACE_GLOBAL } from '../lib/keyValueStore';
import { useActiveRequestId } from './useActiveRequestId';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useGrpcRequests } from './useGrpcRequests';
import { useHttpRequest } from './useHttpRequest';
import { useHttpRequests } from './useHttpRequests';
import { useKeyValue } from './useKeyValue';

const useHistoryState = createGlobalState<string[]>([]);

const kvKey = (workspaceId: string) => 'recent_requests::' + workspaceId;
const namespace = NAMESPACE_GLOBAL;
const defaultValue: string[] = [];

export function useRecentRequests() {
  const httpRequests = useHttpRequests();
  const grpcRequests = useGrpcRequests();
  const requests = useMemo(() => [...httpRequests, ...grpcRequests], [httpRequests, grpcRequests]);
  const activeWorkspaceId = useActiveWorkspaceId();
  const activeRequestId = useActiveRequestId();

  const [history, setHistory] = useHistoryState();
  const kv = useKeyValue<string[]>({
    key: kvKey(activeWorkspaceId ?? 'n/a'),
    namespace,
    defaultValue,
  });

  // Load local storage state on initial render
  useEffectOnce(() => {
    if (kv.value) {
      setHistory(kv.value);
    }
  });

  // Update local storage state when history changes
  useEffect(() => {
    kv.set(history);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  // Set history when active request changes
  useEffect(() => {
    setHistory((currentHistory: string[]) => {
      if (activeRequestId === null) return currentHistory;
      const withoutCurrentRequest = currentHistory.filter((id) => id !== activeRequestId);
      return [activeRequestId, ...withoutCurrentRequest];
    });
  }, [activeRequestId, setHistory]);

  const onlyValidIds = useMemo(
    () => history.filter((id) => requests.some((r) => r.id === id)),
    [history, requests],
  );

  return onlyValidIds;
}

export async function getRecentRequests(workspaceId: string) {
  return getKeyValue<string[]>({
    namespace,
    key: kvKey(workspaceId),
    fallback: defaultValue,
  });
}
