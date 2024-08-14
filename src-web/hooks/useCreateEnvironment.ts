import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Environment } from '@yaakapp/api';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useActiveWorkspace } from './useActiveWorkspace';
import { environmentsQueryKey } from './useEnvironments';
import { usePrompt } from './usePrompt';

export function useCreateEnvironment() {
  const [, setActiveEnvironmentId] = useActiveEnvironmentId();
  const prompt = usePrompt();
  const workspace = useActiveWorkspace();
  const queryClient = useQueryClient();

  return useMutation<Environment, unknown, void>({
    mutationKey: ['create_environment'],
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
      return invokeCmd('cmd_create_environment', {
        name,
        variables: [],
        workspaceId: workspace?.id,
      });
    },
    onSettled: () => trackEvent('environment', 'create'),
    onSuccess: async (environment) => {
      if (workspace == null) return;
      setActiveEnvironmentId(environment.id);
      queryClient.setQueryData<Environment[]>(
        environmentsQueryKey({ workspaceId: workspace.id }),
        (environments) => [...(environments ?? []), environment],
      );
    },
  });
}
