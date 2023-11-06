import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpResponse } from '../lib/models';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';

export function useSendAnyRequest() {
  const environmentId = useActiveEnvironmentId();
  return useMutation<HttpResponse, string, string | null>({
    mutationFn: (id) => invoke('send_request', { requestId: id, environmentId }),
  });
}
