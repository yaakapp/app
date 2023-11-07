import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { trackEvent } from '../lib/analytics';
import type { Workspace } from '../lib/models';
import { useAppRoutes } from './useAppRoutes';
import { workspacesQueryKey } from './useWorkspaces';

export function useCreateWorkspace({ navigateAfter }: { navigateAfter: boolean }) {
  const routes = useAppRoutes();
  const queryClient = useQueryClient();
  return useMutation<Workspace, unknown, Pick<Workspace, 'name'>>({
    mutationFn: (patch) => {
      return invoke('create_workspace', patch);
    },
    onSettled: () => trackEvent('workspace', 'create'),
    onSuccess: async (workspace) => {
      queryClient.setQueryData<Workspace[]>(workspacesQueryKey({}), (workspaces) => [
        ...(workspaces ?? []),
        workspace,
      ]);
      if (navigateAfter) {
        routes.navigate('workspace', { workspaceId: workspace.id });
      }
    },
  });
}
