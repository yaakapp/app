import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InlineCode } from '../components/core/InlineCode';
import { trackEvent } from '../lib/analytics';
import { fallbackRequestName } from '../lib/fallbackRequestName';
import type { HttpRequest } from '../lib/models';
import { getHttpRequest } from '../lib/store';
import { invokeCmd } from '../lib/tauri';
import { useConfirm } from './useConfirm';
import { httpRequestsQueryKey } from './useHttpRequests';
import { httpResponsesQueryKey } from './useHttpResponses';

export function useDeleteAnyHttpRequest() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  return useMutation<HttpRequest | null, string, string>({
    mutationKey: ['delete_any_http_request'],
    mutationFn: async (id) => {
      const request = await getHttpRequest(id);
      if (request == null) return null;

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
      return invokeCmd('cmd_delete_http_request', { requestId: id });
    },
    onSettled: () => trackEvent('http_request', 'delete'),
    onSuccess: async (request) => {
      // Was it cancelled?
      if (request === null) return;

      const { workspaceId, id: requestId } = request;
      queryClient.setQueryData(httpResponsesQueryKey({ requestId }), []); // Responses were deleted
      queryClient.setQueryData<HttpRequest[]>(httpRequestsQueryKey({ workspaceId }), (requests) =>
        (requests ?? []).filter((r) => r.id !== requestId),
      );
    },
  });
}
