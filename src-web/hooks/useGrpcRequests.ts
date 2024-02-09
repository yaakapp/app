import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { GrpcRequest } from '../lib/models';
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
        return (await invoke('cmd_list_grpc_requests', { workspaceId })) as GrpcRequest[];
      },
    }).data ?? []
  );
}
