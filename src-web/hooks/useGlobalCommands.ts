import { invoke } from '@tauri-apps/api/core';
import { useAppRoutes } from './useAppRoutes';
import { useRegisterCommand } from './useCommands';
import { usePrompt } from './usePrompt';

export function useGlobalCommands() {
  const prompt = usePrompt();
  const routes = useAppRoutes();

  useRegisterCommand('workspace.create', {
    name: 'New Workspace',
    track: ['workspace', 'create'],
    onSuccess: async (workspace) => {
      routes.navigate('workspace', { workspaceId: workspace.id });
    },
    mutationFn: async ({ name: patchName }) => {
      const name =
        patchName ??
        (await prompt({
          id: 'new-workspace',
          name: 'name',
          label: 'Name',
          defaultValue: 'My Workspace',
          title: 'New Workspace',
          confirmLabel: 'Create',
          placeholder: 'My Workspace',
        }));
      return invoke('cmd_create_workspace', { name });
    },
  });
}
