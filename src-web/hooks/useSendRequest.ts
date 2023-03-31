import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpResponse } from '../lib/models';
import { responsesQueryKey } from './useResponses';

export function useSendRequest(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation<HttpResponse, string>({
    mutationFn: async () => {
      return invoke('send_request', { requestId: id });
    },
    onSuccess: (response) => {
      queryClient.setQueryData<HttpResponse[]>(responsesQueryKey(response), (responses) => [
        ...(responses ?? []),
        response,
      ]);
    },
  }).mutate;
}
