import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpResponse } from '../lib/models';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';

export function useSendRequest(id: string | null) {
  const environmentId = useActiveEnvironmentId();
  return useMutation<HttpResponse, string>({
    mutationFn: () => invoke('send_request', { requestId: id, environmentId }),
  }).mutate;
}
