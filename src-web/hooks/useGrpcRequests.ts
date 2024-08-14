import { useQuery } from '@tanstack/react-query';
import type { GrpcRequest } from '@yaakapp/api';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';

export function grpcRequestsQueryKey({ workspaceId }: { workspaceId: string }) {
  return ['grpc_requests', { workspaceId }];
}

export function useGrpcRequests() {
  const workspace = useActiveWorkspace();
  return (
    useQuery({
      enabled: workspace != null,
      queryKey: grpcRequestsQueryKey({ workspaceId: workspace?.id ?? 'n/a' }),
      queryFn: async () => {
        if (workspace == null) return [];
        return (await invokeCmd('cmd_list_grpc_requests', {
          workspaceId: workspace.id,
        })) as GrpcRequest[];
      },
    }).data ?? []
  );
}
