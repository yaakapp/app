import { useCallback, useMemo } from 'react';
import type { Environment } from '../lib/models';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useEnvironments } from './useEnvironments';

export function useActiveEnvironment(): [Environment | null, (environment: Environment) => void] {
  const [id, setId] = useActiveEnvironmentId();
  const environments = useEnvironments();
  const environment = useMemo(
    () => environments.find((w) => w.id === id) ?? null,
    [environments, id],
  );

  const setActiveEnvironment = useCallback((e: Environment) => {
    setId(e.id)
  }, [setId]);

  return [environment, setActiveEnvironment];
}
