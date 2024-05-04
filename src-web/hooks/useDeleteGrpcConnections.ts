import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { trackEvent } from '../lib/analytics';
import { grpcConnectionsQueryKey } from './useGrpcConnections';

export function useDeleteGrpcConnections(requestId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (requestId === undefined) return;
      await invoke('cmd_delete_all_grpc_connections', { requestId });
    },
    onSettled: () => trackEvent('grpc_connection', 'delete_many'),
    onSuccess: async () => {
      if (requestId === undefined) return;
      queryClient.setQueryData(grpcConnectionsQueryKey({ requestId }), []);
    },
  });
}
