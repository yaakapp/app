import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { GrpcMessage } from '../lib/models';

export function grpcMessagesQueryKey({ connectionId }: { connectionId: string }) {
  return ['grpc_messages', { connectionId }];
}

export function useGrpcMessages(connectionId: string | null) {
  return (
    useQuery<GrpcMessage[]>({
      enabled: connectionId !== null,
      initialData: [],
      queryKey: grpcMessagesQueryKey({ connectionId: connectionId ?? 'n/a' }),
      queryFn: async () => {
        return (await invoke('cmd_list_grpc_messages', {
          connectionId,
          limit: 200,
        })) as GrpcMessage[];
      },
    }).data ?? []
  );
}
