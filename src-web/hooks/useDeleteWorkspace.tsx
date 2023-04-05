import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { InlineCode } from '../components/core/InlineCode';
import type { Workspace } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useConfirm } from './useConfirm';
import { requestsQueryKey } from './useRequests';
import { useRoutes } from './useRoutes';
import { workspacesQueryKey } from './useWorkspaces';

export function useDeleteWorkspace(workspace: Workspace | null) {
  const queryClient = useQueryClient();
  const activeWorkspaceId = useActiveWorkspaceId();
  const routes = useRoutes();
  const confirm = useConfirm();

  return useMutation<Workspace | null, string>({
    mutationFn: async () => {
      const confirmed = await confirm({
        title: 'Delete Workspace',
        variant: 'delete',
        description: (
          <>
            Are you sure you want to delete <InlineCode>{workspace?.name}</InlineCode>?
          </>
        ),
      });
      if (!confirmed) return null;
      return invoke('delete_workspace', { id: workspace?.id });
    },
    onSuccess: async (workspace) => {
      if (workspace === null) return;

      const { id: workspaceId } = workspace;
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
