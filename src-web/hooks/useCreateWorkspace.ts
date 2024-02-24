import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { trackEvent } from '../lib/analytics';
import type { Workspace } from '../lib/models';
import { useAppRoutes } from './useAppRoutes';

export function useCreateWorkspace({ navigateAfter }: { navigateAfter: boolean }) {
  const routes = useAppRoutes();
  return useMutation<Workspace, unknown, Pick<Workspace, 'name'>>({
    mutationFn: (patch) => {
      return invoke('cmd_create_workspace', patch);
    },
    onSettled: () => trackEvent('workspace', 'create'),
    onSuccess: async (workspace) => {
      if (navigateAfter) {
        routes.navigate('workspace', { workspaceId: workspace.id });
      }
    },
  });
}
