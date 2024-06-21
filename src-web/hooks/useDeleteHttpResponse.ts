import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackEvent } from '../lib/analytics';
import type { HttpResponse } from '../lib/models';
import { invokeCmd } from '../lib/tauri';
import { httpResponsesQueryKey } from './useHttpResponses';

export function useDeleteHttpResponse(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation<HttpResponse>({
    mutationKey: ['delete_http_response', id],
    mutationFn: async () => {
      return await invokeCmd('cmd_delete_http_response', { id: id });
    },
    onSettled: () => trackEvent('http_response', 'delete'),
    onSuccess: ({ requestId, id: responseId }) => {
      queryClient.setQueryData<HttpResponse[]>(httpResponsesQueryKey({ requestId }), (responses) =>
        (responses ?? []).filter((response) => response.id !== responseId),
      );
    },
  });
}
