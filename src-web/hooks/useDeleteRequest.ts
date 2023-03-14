import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { requestsQueryKey } from './useRequests';

export function useDeleteRequest(request: HttpRequest | null) {
  const queryClient = useQueryClient();
  return useMutation<void, string>({
    mutationFn: async () => {
      if (request == null) return;
      await invoke('delete_request', { requestId: request.id });
    },
    onSuccess: async () => {
      if (request == null) return;
      await queryClient.invalidateQueries(requestsQueryKey(request.workspaceId));
    },
  });
}
