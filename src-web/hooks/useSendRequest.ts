import { useMutation } from '@tanstack/react-query';
import type { HttpResponse } from '../lib/models';
import { useSendAnyRequest } from './useSendAnyRequest';

export function useSendRequest(id: string | null, options: { download?: boolean } = {}) {
  const sendAnyRequest = useSendAnyRequest(options);
  return useMutation<HttpResponse | null, string>({
    mutationFn: () => sendAnyRequest.mutateAsync(id),
  });
}
