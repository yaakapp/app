import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { InlineCode } from '../components/core/InlineCode';
import { trackEvent } from '../lib/analytics';
import { fallbackRequestName } from '../lib/fallbackRequestName';
import type { HttpRequest } from '../lib/models';
import { getRequest } from '../lib/store';
import { useConfirm } from './useConfirm';
import { requestsQueryKey } from './useRequests';
import { responsesQueryKey } from './useResponses';

export function useDeleteAnyRequest() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  return useMutation<HttpRequest | null, string, string>({
    mutationFn: async (id) => {
      const request = await getRequest(id);
      const confirmed = await confirm({
        id: 'delete-request',
        title: 'Delete Request',
        variant: 'delete',
        description: (
          <>
            Permanently delete <InlineCode>{fallbackRequestName(request)}</InlineCode>?
          </>
        ),
      });
      if (!confirmed) return null;
      return invoke('cmd_delete_request', { requestId: id });
    },
    onSettled: () => trackEvent('HttpRequest', 'Delete'),
    onSuccess: async (request) => {
      // Was it cancelled?
      if (request === null) return;

      const { workspaceId, id: requestId } = request;
      queryClient.setQueryData(responsesQueryKey({ requestId }), []); // Responses were deleted
      queryClient.setQueryData<HttpRequest[]>(requestsQueryKey({ workspaceId }), (requests) =>
        (requests ?? []).filter((r) => r.id !== requestId),
      );
    },
  });
}
