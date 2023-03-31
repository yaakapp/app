import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpResponse } from '../lib/models';

export function useSendRequest(id: string | null) {
  return useMutation<HttpResponse, string>({
    mutationFn: () => invoke('send_request', { requestId: id }),
  }).mutate;
}
