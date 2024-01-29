import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { trackEvent } from '../lib/analytics';
import type { Environment } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useAppRoutes } from './useAppRoutes';
import { environmentsQueryKey } from './useEnvironments';
import { usePrompt } from './usePrompt';

export function useCreateEnvironment() {
  const routes = useAppRoutes();
  const prompt = usePrompt();
  const workspaceId = useActiveWorkspaceId();
  const queryClient = useQueryClient();

  return useMutation<Environment, unknown, void>({
    mutationFn: async () => {
      const name = await prompt({
        id: 'new-environment',
        name: 'name',
        title: 'New Environment',
        label: 'Name',
        defaultValue: 'My Environment',
      });
      return invoke('create_environment', { name, variables: [], workspaceId });
    },
    onSettled: () => trackEvent('Environment', 'Create'),
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
