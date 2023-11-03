import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { Environment } from '../lib/models';
import { environmentsQueryKey, useEnvironments } from './useEnvironments';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useAppRoutes } from './useAppRoutes';
import { usePrompt } from './usePrompt';
import { useWorkspaces } from './useWorkspaces';

export function useCreateEnvironment() {
  const routes = useAppRoutes();
  const prompt = usePrompt();
  const workspaceId = useActiveWorkspaceId();
  const queryClient = useQueryClient();
  const environments = useEnvironments();
  const workspaces = useWorkspaces();

  return useMutation<Environment, unknown, void>({
    mutationFn: async () => {
      const name = await prompt({
        name: 'name',
        title: 'Create Environment',
        label: 'Name',
        defaultValue: 'My Environment',
      });
      const variables =
        environments.length === 0 && workspaces.length === 1
          ? [{ name: 'first_variable', value: 'some reusable value' }]
          : [];
      return invoke('create_environment', { name, variables, workspaceId });
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
