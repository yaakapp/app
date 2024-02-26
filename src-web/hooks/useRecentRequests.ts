import { useEffect, useMemo } from 'react';
import { getKeyValue, NAMESPACE_GLOBAL } from '../lib/keyValueStore';
import { useActiveRequestId } from './useActiveRequestId';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useGrpcRequests } from './useGrpcRequests';
import { useHttpRequests } from './useHttpRequests';
import { useKeyValue } from './useKeyValue';

const kvKey = (workspaceId: string) => 'recent_requests::' + workspaceId;
const namespace = NAMESPACE_GLOBAL;
const fallback: string[] = [];

export function useRecentRequests() {
  const httpRequests = useHttpRequests();
  const grpcRequests = useGrpcRequests();
  const requests = useMemo(() => [...httpRequests, ...grpcRequests], [httpRequests, grpcRequests]);
  const activeWorkspaceId = useActiveWorkspaceId();
  const activeRequestId = useActiveRequestId();

  const kv = useKeyValue<string[]>({
    key: kvKey(activeWorkspaceId ?? 'n/a'),
    namespace,
    fallback,
  });

  // Set history when active request changes
  useEffect(() => {
    kv.set((currentHistory) => {
      if (activeRequestId === null) return currentHistory;
      const withoutCurrentRequest = currentHistory.filter((id) => id !== activeRequestId);
      return [activeRequestId, ...withoutCurrentRequest];
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRequestId]);

  const onlyValidIds = useMemo(
    () => kv.value?.filter((id) => requests.some((r) => r.id === id)) ?? [],
    [kv.value, requests],
  );

  return onlyValidIds;
}

export async function getRecentRequests(workspaceId: string) {
  return getKeyValue<string[]>({
    namespace,
    key: kvKey(workspaceId),
    fallback,
  });
}
