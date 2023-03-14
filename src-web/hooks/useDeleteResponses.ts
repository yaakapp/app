import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';

export function useDeleteResponses(requestId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (requestId == null) return;
      await invoke('delete_all_responses', { requestId });
    },
    onSuccess: () => {
      if (requestId == null) return;
      queryClient.setQueryData(['responses', { requestId: requestId }], []);
    },
  });
}
