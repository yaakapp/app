import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { trackEvent } from '../lib/analytics';
import type { Workspace } from '../lib/models';
import { useAppRoutes } from './useAppRoutes';
import { usePrompt } from './usePrompt';

export function useCreateWorkspace({ navigateAfter }: { navigateAfter: boolean }) {
  const routes = useAppRoutes();
  const prompt = usePrompt();
  return useMutation<Workspace, unknown, Partial<Pick<Workspace, 'name'>>>({
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
    onSettled: () => trackEvent('workspace', 'create'),
    onSuccess: async (workspace) => {
      if (navigateAfter) {
        routes.navigate('workspace', { workspaceId: workspace.id });
      }
    },
  });
}
