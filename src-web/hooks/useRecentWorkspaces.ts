import { useEffect, useMemo } from 'react';
import { createGlobalState, useEffectOnce } from 'react-use';
import { getKeyValue, NAMESPACE_GLOBAL } from '../lib/keyValueStore';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useKeyValue } from './useKeyValue';
import { useWorkspaces } from './useWorkspaces';

const useHistoryState = createGlobalState<string[]>([]);

const kvKey = () => 'recent_workspaces';
const namespace = NAMESPACE_GLOBAL;
const defaultValue: string[] = [];

export function useRecentWorkspaces() {
  const workspaces = useWorkspaces();
  const activeWorkspaceId = useActiveWorkspaceId();
  const [history, setHistory] = useHistoryState();
  const kv = useKeyValue<string[]>({
    key: kvKey(),
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
      if (activeWorkspaceId === null) return currentHistory;
      const withoutCurrent = currentHistory.filter((id) => id !== activeWorkspaceId);
      return [activeWorkspaceId, ...withoutCurrent];
    });
  }, [activeWorkspaceId, setHistory]);

  const onlyValidIds = useMemo(
    () => history.filter((id) => workspaces.some((w) => w.id === id)),
    [history, workspaces],
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
