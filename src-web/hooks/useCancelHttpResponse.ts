import { useMutation } from '@tanstack/react-query';
import { event } from '@tauri-apps/api';
import { trackEvent } from '../lib/analytics';

export function useCancelHttpResponse(id: string | null) {
  return useMutation<void>({
    mutationFn: () => event.emit(`cancel_http_response_${id}`),
    onSettled: () => trackEvent('http_response', 'cancel'),
  });
}
