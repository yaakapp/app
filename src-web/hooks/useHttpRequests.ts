import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import type { HttpRequest } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

export function httpRequestsQueryKey({ workspaceId }: { workspaceId: string }) {
  return ['http_requests', { workspaceId }];
}

export function useHttpRequests() {
  const workspaceId = useActiveWorkspaceId();
  return (
    useQuery({
      enabled: workspaceId != null,
      queryKey: httpRequestsQueryKey({ workspaceId: workspaceId ?? 'n/a' }),
      queryFn: async () => {
        if (workspaceId == null) return [];
        return (await invoke('cmd_list_http_requests', { workspaceId })) as HttpRequest[];
      },
    }).data ?? []
  );
}
