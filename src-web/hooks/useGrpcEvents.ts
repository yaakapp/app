import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import type { GrpcEvent } from '../lib/models';

export function grpcEventsQueryKey({ connectionId }: { connectionId: string }) {
  return ['grpc_events', { connectionId }];
}

export function useGrpcEvents(connectionId: string | null) {
  return (
    useQuery<GrpcEvent[]>({
      enabled: connectionId !== null,
      initialData: [],
      queryKey: grpcEventsQueryKey({ connectionId: connectionId ?? 'n/a' }),
      queryFn: async () => {
        return (await invoke('cmd_list_grpc_events', {
          connectionId,
          limit: 200,
        })) as GrpcEvent[];
      },
    }).data ?? []
  );
}
