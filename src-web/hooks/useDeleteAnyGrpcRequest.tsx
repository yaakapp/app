import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { InlineCode } from '../components/core/InlineCode';
import { trackEvent } from '../lib/analytics';
import { fallbackRequestName } from '../lib/fallbackRequestName';
import type { GrpcRequest } from '../lib/models';
import { getGrpcRequest } from '../lib/store';
import { useConfirm } from './useConfirm';
import { grpcRequestsQueryKey } from './useGrpcRequests';

export function useDeleteAnyGrpcRequest() {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  return useMutation<GrpcRequest | null, string, string>({
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
      return invoke('cmd_delete_grpc_request', { requestId: id });
    },
    onSettled: () => trackEvent('GrpcRequest', 'Delete'),
    onSuccess: async (request) => {
      if (request === null) return;

      const { workspaceId, id: requestId } = request;
      queryClient.setQueryData<GrpcRequest[]>(grpcRequestsQueryKey({ workspaceId }), (requests) =>
        (requests ?? []).filter((r) => r.id !== requestId),
      );
    },
  });
}
