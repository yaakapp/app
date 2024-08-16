import type { EnvironmentVariable } from '@yaakapp/api';
import { useMemo } from 'react';
import { useActiveEnvironment } from './useActiveEnvironment';
import { useActiveWorkspace } from './useActiveWorkspace';

export function useActiveEnvironmentVariables() {
  const workspace = useActiveWorkspace();
  const [environment] = useActiveEnvironment();

  const variables = useMemo(() => {
    const varMap: Record<string, EnvironmentVariable> = {};

    const allVariables = [...(workspace?.variables ?? []), ...(environment?.variables ?? [])];

    for (const v of allVariables) {
      if (!v.enabled || !v.name) continue;
      varMap[v.name] = v;
    }

    return Object.values(varMap);
  }, [workspace, environment]);

  return variables;
}
