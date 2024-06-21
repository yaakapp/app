import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';
import { grpcConnectionsQueryKey } from './useGrpcConnections';

export function useDeleteGrpcConnections(requestId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['delete_grpc_connections', requestId],
    mutationFn: async () => {
      if (requestId === undefined) return;
      await invokeCmd('cmd_delete_all_grpc_connections', { requestId });
    },
    onSettled: () => trackEvent('grpc_connection', 'delete_many'),
    onSuccess: async () => {
      if (requestId === undefined) return;
      queryClient.setQueryData(grpcConnectionsQueryKey({ requestId }), []);
    },
  });
}
