import { useMemo } from 'react';
import type { Environment } from '@yaakapp/api';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useEnvironments } from './useEnvironments';

export function useActiveEnvironment(): Environment | null {
  const id = useActiveEnvironmentId();
  const environments = useEnvironments();
  return useMemo(() => environments.find((w) => w.id === id) ?? null, [environments, id]);
}
