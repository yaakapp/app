import { useCallback, useMemo } from 'react';
import type { Environment } from '../lib/models';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useEnvironments } from './useEnvironments';

export function useActiveEnvironment(): Environment | null {
  const id = useActiveEnvironmentId();
  const environments = useEnvironments();
  const environment = useMemo(
    () => environments.find((w) => w.id === id) ?? null,
    [environments, id],
  );

  return environment;
}
