import { useMutation } from '@tanstack/react-query';
import type { HttpResponse } from '@yaakapp-internal/models';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';

export function useDeleteHttpResponse(id: string | null) {
  return useMutation<HttpResponse>({
    mutationKey: ['delete_http_response', id],
    mutationFn: async () => {
      return await invokeCmd('cmd_delete_http_response', { id: id });
    },
    onSettled: () => trackEvent('http_response', 'delete'),
  });
}
