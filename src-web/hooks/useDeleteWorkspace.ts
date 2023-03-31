import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { Workspace } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { requestsQueryKey } from './useRequests';
import { useRoutes } from './useRoutes';
import { workspacesQueryKey } from './useWorkspaces';

export function useDeleteWorkspace(id: string | null) {
  const queryClient = useQueryClient();
  const activeWorkspaceId = useActiveWorkspaceId();
  const routes = useRoutes();
  return useMutation<Workspace, string>({
    mutationFn: () => {
      return invoke('delete_workspace', { id });
    },
    onSuccess: async ({ id: workspaceId }) => {
      queryClient.setQueryData<Workspace[]>(workspacesQueryKey({}), (workspaces) =>
        workspaces?.filter((workspace) => workspace.id !== workspaceId),
      );
      if (workspaceId === activeWorkspaceId) {
        routes.navigate('workspaces');
      }

      // Also clean up other things that may have been deleted
      queryClient.setQueryData(requestsQueryKey({ workspaceId }), []);
      await queryClient.invalidateQueries(requestsQueryKey({ workspaceId }));
    },
  });
}
