import { useMutation } from '@tanstack/react-query';
import type { HttpRequest } from '@yaakapp-internal/models';
import { InlineCode } from '../components/core/InlineCode';
import { trackEvent } from '../lib/analytics';
import { resolvedModelName } from '../lib/resolvedModelName';
import { getHttpRequest } from '../lib/store';
import { invokeCmd } from '../lib/tauri';
import { useConfirm } from './useConfirm';

export function useDeleteAnyHttpRequest() {
  const confirm = useConfirm();

  return useMutation<HttpRequest | null, string, string>({
    mutationKey: ['delete_any_http_request'],
    mutationFn: async (id) => {
      const request = await getHttpRequest(id);
      if (request == null) return null;

      const confirmed = await confirm({
        id: 'delete-request',
        title: 'Delete Request',
        variant: 'delete',
        description: (
          <>
            Permanently delete <InlineCode>{resolvedModelName(request)}</InlineCode>?
          </>
        ),
      });
      if (!confirmed) return null;
      return invokeCmd('cmd_delete_http_request', { requestId: id });
    },
    onSettled: () => trackEvent('http_request', 'delete'),
  });
}
