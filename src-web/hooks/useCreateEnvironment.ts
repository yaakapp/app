import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
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
        description: 'Create multiple environments with different sets of variables',
        label: 'Name',
        placeholder: 'My Environment',
        defaultValue: 'My Environment',
      });
      return invoke('cmd_create_environment', { name, variables: [], workspaceId });
    },
    onSettled: () => trackEvent('environment', 'create'),
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
