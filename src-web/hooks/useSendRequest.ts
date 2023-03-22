import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';

export function useSendRequest(id: string | null) {
  return useMutation<void, string>({
    mutationFn: async () => {
      if (id === null) return;
      await invoke('send_request', { requestId: id });
    },
  }).mutate;
}
