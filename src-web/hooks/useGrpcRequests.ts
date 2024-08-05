import { useQuery } from '@tanstack/react-query';
import type { GrpcRequest } from '@yaakapp/api';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

export function grpcRequestsQueryKey({ workspaceId }: { workspaceId: string }) {
  return ['grpc_requests', { workspaceId }];
}

export function useGrpcRequests() {
  const workspaceId = useActiveWorkspaceId();
  return (
    useQuery({
      enabled: workspaceId != null,
      queryKey: grpcRequestsQueryKey({ workspaceId: workspaceId ?? 'n/a' }),
      queryFn: async () => {
        if (workspaceId == null) return [];
        return (await invokeCmd('cmd_list_grpc_requests', { workspaceId })) as GrpcRequest[];
      },
    }).data ?? []
  );
}
