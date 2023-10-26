import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { Environment } from '../lib/models';
import { environmentsQueryKey } from './useEnvironments';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useAppRoutes } from './useAppRoutes';

export function useCreateEnvironment() {
  const workspaceId = useActiveWorkspaceId();
  const queryClient = useQueryClient();
  const routes = useAppRoutes();

  return useMutation<Environment, unknown, Pick<Environment, 'name'>>({
    mutationFn: (patch) => {
      return invoke('create_environment', { ...patch, workspaceId });
    },
    onSuccess: async (environment) => {
      if (workspaceId == null) return;
      routes.setEnvironment(environment);
      queryClient.setQueryData<Environment[]>(
        environmentsQueryKey({ workspaceId }),
        (environments) => [...(environments ?? []), environment],
      );
    },
  });
}
