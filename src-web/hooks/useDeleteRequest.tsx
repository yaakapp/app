import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { InlineCode } from '../components/core/InlineCode';
import type { HttpRequest } from '../lib/models';
import { getRequest } from '../lib/store';
import { useActiveRequestId } from './useActiveRequestId';
import { useConfirm } from './useConfirm';
import { requestsQueryKey } from './useRequests';
import { responsesQueryKey } from './useResponses';
import { useRoutes } from './useRoutes';

export function useDeleteRequest(id: string | null) {
  const queryClient = useQueryClient();
  const activeRequestId = useActiveRequestId();
  const routes = useRoutes();
  const confirm = useConfirm();

  return useMutation<HttpRequest | null, string>({
    mutationFn: async () => {
      const request = await getRequest(id);
      const confirmed = await confirm({
        title: 'Delete Request',
        variant: 'delete',
        description: (
          <>
            Are you sure you want to delete <InlineCode>{request?.name}</InlineCode>?
          </>
        ),
      });
      if (!confirmed) return null;
      return invoke('delete_request', { requestId: id });
    },
    onSuccess: async (request) => {
      // Was it cancelled?
      if (request === null) return;

      const { workspaceId, id: requestId } = request;
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
