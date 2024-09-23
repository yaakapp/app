import { useMutation } from '@tanstack/react-query';
import type { GrpcConnection } from '@yaakapp-internal/models';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';

export function useDeleteGrpcConnection(id: string | null) {
  return useMutation<GrpcConnection>({
    mutationKey: ['delete_grpc_connection', id],
    mutationFn: async () => {
      return await invokeCmd('cmd_delete_grpc_connection', { id: id });
    },
    onSettled: () => trackEvent('grpc_connection', 'delete'),
  });
}
