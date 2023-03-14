import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpResponse } from '../lib/models';

export function useDeleteResponse(response: HttpResponse | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (response === null) return;
      await invoke('delete_response', { id: response.id });
    },
    onSuccess: () => {
      if (response === null) return;
      queryClient.setQueryData(
        ['responses', { requestId: response.requestId }],
        (responses: HttpResponse[] = []) => responses.filter((r) => r.id !== response.id),
      );
    },
  });
}
