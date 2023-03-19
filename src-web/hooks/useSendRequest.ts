import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { responsesQueryKey } from './useResponses';

export function useSendRequest(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation<void, string>({
    mutationFn: async () => {
      if (id === null) return;
      await invoke('send_request', { requestId: id });
    },
    onSuccess: async () => {
      if (id === null) return;
      await queryClient.invalidateQueries(responsesQueryKey(id));
    },
  }).mutate;
}
