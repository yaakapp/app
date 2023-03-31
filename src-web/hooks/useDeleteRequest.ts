import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { useActiveRequestId } from './useActiveRequestId';
import { requestsQueryKey } from './useRequests';
import { responsesQueryKey } from './useResponses';
import { useRoutes } from './useRoutes';

export function useDeleteRequest(id: string | null) {
  const queryClient = useQueryClient();
  const activeRequestId = useActiveRequestId();
  const routes = useRoutes();
  return useMutation<HttpRequest, string>({
    mutationFn: async () => invoke('delete_request', { requestId: id }),
    onSuccess: async ({ workspaceId, id: requestId }) => {
      queryClient.setQueryData(responsesQueryKey({ requestId }), []); // Responses were deleted
      queryClient.setQueryData<HttpRequest[]>(requestsQueryKey({ workspaceId }), (requests) =>
        (requests ?? []).filter((r) => r.id !== requestId),
      );
      if (activeRequestId === requestId) {
        routes.navigate('workspace', { workspaceId });
      }
    },
  });
}
