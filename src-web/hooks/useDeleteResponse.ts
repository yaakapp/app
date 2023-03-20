import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';

export function useDeleteResponse(id: string | null) {
  return useMutation({
    mutationFn: async () => {
      if (id === null) return;
      await invoke('delete_response', { id: id });
    },
  });
}
