import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { responsesQueryKey } from './useResponses';

export function useDeleteResponses(requestId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!requestId) return;
      await invoke('delete_all_responses', { requestId });
    },
    onSuccess: async () => {
      if (!requestId) return;
      queryClient.setQueryData(responsesQueryKey({ requestId }), []);
    },
  });
}
