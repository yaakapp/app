import { useMutation } from '@tanstack/react-query';
import type { Workspace } from '@yaakapp-internal/models';
import { invokeCmd } from '../lib/tauri';
import { useAppRoutes } from './useAppRoutes';
import { usePrompt } from './usePrompt';

export function useCreateWorkspace() {
  const routes = useAppRoutes();
  const prompt = usePrompt();
  return useMutation<Workspace, void, void>({
    mutationKey: ['create_workspace'],
    mutationFn: async () => {
      const name = await prompt({
        id: 'new-workspace',
        label: 'Name',
        defaultValue: 'My Workspace',
        title: 'New Workspace',
        placeholder: 'My Workspace',
        confirmText: 'Create',
      });
      return invokeCmd('cmd_create_workspace', { name });
    },
    onSuccess: async (workspace) => {
      routes.navigate('workspace', { workspaceId: workspace.id });
    },
  });
}
