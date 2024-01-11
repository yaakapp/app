import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { trackEvent } from '../lib/analytics';
import type { HttpResponse } from '../lib/models';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useAlert } from './useAlert';

export function useSendAnyRequest() {
  const environmentId = useActiveEnvironmentId();
  const alert = useAlert();
  return useMutation<HttpResponse, string, string | null>({
    mutationFn: (id) => invoke('send_request', { requestId: id, environmentId }),
    onSettled: () => trackEvent('HttpRequest', 'Send'),
    onError: (err) => alert({ title: 'Export Failed', body: err }),
  });
}
