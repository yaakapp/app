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
      const workspace = await invokeCmd<Workspace>('cmd_create_workspace', { name });

      // Give some time for the workspace to sync to the local store
      await new Promise((resolve) => setTimeout(resolve, 100));

      return workspace;
    },
    onSuccess: async (workspace) => {
      routes.navigate('workspace', { workspaceId: workspace.id });
    },
  });
}
