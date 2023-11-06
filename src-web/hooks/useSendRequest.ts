import { useMutation } from '@tanstack/react-query';
import type { HttpResponse } from '../lib/models';
import { useSendAnyRequest } from './useSendAnyRequest';

export function useSendRequest(id: string | null) {
  const sendAnyRequest = useSendAnyRequest();
  return useMutation<HttpResponse, string>({
    mutationFn: () => sendAnyRequest.mutateAsync(id),
  });
}
