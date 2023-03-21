import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useRoutes } from './useRoutes';
import { workspacesQueryKey } from './useWorkspaces';

export function useDeleteWorkspace(id: string | null) {
  const queryClient = useQueryClient();
  const activeWorkspaceId = useActiveWorkspaceId();
  const routes = useRoutes();
  return useMutation<void, string>({
    mutationFn: async () => {
      if (id === null) return;
      await invoke('delete_workspace', { id });
    },
    onSuccess: async () => {
      if (id === null) return;
      await queryClient.invalidateQueries(workspacesQueryKey());
      if (id === activeWorkspaceId) {
        routes.navigate('workspaces');
      }
    },
  });
}
