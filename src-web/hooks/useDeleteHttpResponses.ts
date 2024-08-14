import { useMutation } from '@tanstack/react-query';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';

export function useDeleteHttpResponses(requestId?: string) {
  return useMutation({
    mutationKey: ['delete_http_responses', requestId],
    mutationFn: async () => {
      if (requestId === undefined) return;
      await invokeCmd('cmd_delete_all_http_responses', { requestId });
    },
    onSettled: () => trackEvent('http_response', 'delete_many'),
  });
}
