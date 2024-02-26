import { useEffect, useMemo } from 'react';
import { getKeyValue, NAMESPACE_GLOBAL } from '../lib/keyValueStore';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useEnvironments } from './useEnvironments';
import { useKeyValue } from './useKeyValue';

const kvKey = (workspaceId: string) => 'recent_environments::' + workspaceId;
const namespace = NAMESPACE_GLOBAL;
const fallback: string[] = [];

export function useRecentEnvironments() {
  const environments = useEnvironments();
  const activeWorkspaceId = useActiveWorkspaceId();
  const activeEnvironmentId = useActiveEnvironmentId();
  const kv = useKeyValue<string[]>({
    key: kvKey(activeWorkspaceId ?? 'n/a'),
    namespace,
    fallback,
  });

  // Set history when active request changes
  useEffect(() => {
    kv.set((currentHistory: string[]) => {
      if (activeEnvironmentId === null) return currentHistory;
      const withoutCurrentEnvironment = currentHistory.filter((id) => id !== activeEnvironmentId);
      return [activeEnvironmentId, ...withoutCurrentEnvironment];
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEnvironmentId]);

  const onlyValidIds = useMemo(
    () => kv.value?.filter((id) => environments.some((e) => e.id === id)) ?? [],
    [kv.value, environments],
  );

  return onlyValidIds;
}

export async function getRecentEnvironments(workspaceId: string) {
  return getKeyValue<string[]>({
    namespace,
    key: kvKey(workspaceId),
    fallback,
  });
}
