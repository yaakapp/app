import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { requestsQueryKey } from './useRequests';

export function useDeleteRequest(id: string | null) {
  const workspaceId = useActiveWorkspaceId();
  const queryClient = useQueryClient();
  return useMutation<void, string>({
    mutationFn: async () => {
      if (id === null) return;
      await invoke('delete_request', { requestId: id });
    },
    onSuccess: async () => {
      if (workspaceId === null || id === null) return;
      await queryClient.invalidateQueries(requestsQueryKey(workspaceId));
    },
  });
}
