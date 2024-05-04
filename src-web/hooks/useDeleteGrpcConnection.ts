import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { trackEvent } from '../lib/analytics';
import type { GrpcConnection } from '../lib/models';
import { grpcConnectionsQueryKey } from './useGrpcConnections';

export function useDeleteGrpcConnection(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation<GrpcConnection>({
    mutationFn: async () => {
      return await invoke('cmd_delete_grpc_connection', { id: id });
    },
    onSettled: () => trackEvent('grpc_connection', 'delete'),
    onSuccess: ({ requestId, id: connectionId }) => {
      queryClient.setQueryData<GrpcConnection[]>(
        grpcConnectionsQueryKey({ requestId }),
        (connections) => (connections ?? []).filter((c) => c.id !== connectionId),
      );
    },
  });
}
