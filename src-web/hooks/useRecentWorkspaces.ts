import { useEffect, useMemo } from 'react';
import { getKeyValue, NAMESPACE_GLOBAL } from '../lib/keyValueStore';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useKeyValue } from './useKeyValue';
import { useWorkspaces } from './useWorkspaces';

const kvKey = () => 'recent_workspaces';
const namespace = NAMESPACE_GLOBAL;
const defaultValue: string[] = [];

export function useRecentWorkspaces() {
  const workspaces = useWorkspaces();
  const activeWorkspaceId = useActiveWorkspaceId();
  const kv = useKeyValue<string[]>({
    key: kvKey(),
    namespace,
    defaultValue,
  });

  // Set history when active request changes
  useEffect(() => {
    kv.set((currentHistory: string[]) => {
      if (activeWorkspaceId === null) return currentHistory;
      const withoutCurrent = currentHistory.filter((id) => id !== activeWorkspaceId);
      return [activeWorkspaceId, ...withoutCurrent];
    }).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onlyValidIds = useMemo(
    () => kv.value?.filter((id) => workspaces.some((w) => w.id === id)) ?? [],
    [kv.value, workspaces],
  );

  return onlyValidIds;
}

export async function getRecentWorkspaces() {
  return getKeyValue<string[]>({
    namespace,
    key: kvKey(),
    fallback: defaultValue,
  });
}
