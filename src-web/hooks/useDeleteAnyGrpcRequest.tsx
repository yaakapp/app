import { useMutation } from '@tanstack/react-query';
import type { GrpcRequest } from '@yaakapp-internal/models';
import { InlineCode } from '../components/core/InlineCode';
import { trackEvent } from '../lib/analytics';
import { fallbackRequestName } from '../lib/fallbackRequestName';
import { getGrpcRequest } from '../lib/store';
import { invokeCmd } from '../lib/tauri';
import { useConfirm } from './useConfirm';

export function useDeleteAnyGrpcRequest() {
  const confirm = useConfirm();

  return useMutation<GrpcRequest | null, string, string>({
    mutationKey: ['delete_any_grpc_request'],
    mutationFn: async (id) => {
      const request = await getGrpcRequest(id);
      if (request == null) return null;

      const confirmed = await confirm({
        id: 'delete-grpc-request',
        title: 'Delete Request',
        variant: 'delete',
        description: (
          <>
            Permanently delete <InlineCode>{fallbackRequestName(request)}</InlineCode>?
          </>
        ),
      });
      if (!confirmed) return null;
      return invokeCmd('cmd_delete_grpc_request', { requestId: id });
    },
    onSettled: () => trackEvent('grpc_request', 'delete'),
  });
}
