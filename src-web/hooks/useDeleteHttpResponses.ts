import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';
import { httpResponsesQueryKey } from './useHttpResponses';

export function useDeleteHttpResponses(requestId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (requestId === undefined) return;
      await invokeCmd('cmd_delete_all_http_responses', { requestId });
    },
    onSettled: () => trackEvent('http_response', 'delete_many'),
    onSuccess: async () => {
      if (requestId === undefined) return;
      queryClient.setQueryData(httpResponsesQueryKey({ requestId }), []);
    },
  });
}
