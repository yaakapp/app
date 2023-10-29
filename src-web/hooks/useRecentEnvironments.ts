import { useEffect } from 'react';
import { createGlobalState, useEffectOnce } from 'react-use';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useKeyValue } from './useKeyValue';
import { NAMESPACE_GLOBAL, getKeyValue } from '../lib/keyValueStore';

const useHistoryState = createGlobalState<string[]>([]);

const kvKey = (workspaceId: string) => 'recent_environments::' + workspaceId;
const namespace = NAMESPACE_GLOBAL;
const defaultValue: string[] = [];

export function useRecentEnvironments() {
  const activeWorkspaceId = useActiveWorkspaceId();
  const activeEnvironmentId = useActiveEnvironmentId();
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
      if (activeEnvironmentId === null) return currentHistory;
      const withoutCurrentEnvironment = currentHistory.filter((id) => id !== activeEnvironmentId);
      return [activeEnvironmentId, ...withoutCurrentEnvironment];
    });
  }, [activeEnvironmentId, setHistory]);

  return history;
}

export async function getRecentEnvironments(workspaceId: string) {
  return getKeyValue<string[]>({
    namespace,
    key: kvKey(workspaceId),
    fallback: defaultValue,
  });
}
