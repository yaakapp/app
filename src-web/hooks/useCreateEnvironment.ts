import { useMutation } from '@tanstack/react-query';
import type { Environment } from '@yaakapp/api';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';
import { useActiveEnvironment } from './useActiveEnvironment';
import { useActiveWorkspace } from './useActiveWorkspace';
import { usePrompt } from './usePrompt';

export function useCreateEnvironment() {
  const [, setActiveEnvironmentId] = useActiveEnvironment();
  const prompt = usePrompt();
  const workspace = useActiveWorkspace();

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
    },
  });
}
