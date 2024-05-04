import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import type { GrpcConnection } from '../lib/models';

export function grpcConnectionsQueryKey({ requestId }: { requestId: string }) {
  return ['grpc_connections', { requestId }];
}

export function useGrpcConnections(requestId: string | null) {
  return (
    useQuery<GrpcConnection[]>({
      enabled: requestId !== null,
      initialData: [],
      queryKey: grpcConnectionsQueryKey({ requestId: requestId ?? 'n/a' }),
      queryFn: async () => {
        return (await invoke('cmd_list_grpc_connections', {
          requestId,
          limit: 200,
        })) as GrpcConnection[];
      },
    }).data ?? []
  );
}
