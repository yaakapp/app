import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { EnvironmentVariable } from '../lib/models';

export function variablesQueryKey({ environmentId }: { environmentId: string }) {
  return ['variables', { environmentId }];
}

export function useVariables({ environmentId }: { environmentId: string }) {
  return (
    useQuery({
      queryKey: variablesQueryKey({ environmentId }),
      queryFn: async () => {
        return (await invoke('cmd_list_variables', { environmentId })) as EnvironmentVariable[];
      },
    }).data ?? []
  );
}
