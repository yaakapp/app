import { useQuery } from '@tanstack/react-query';
import type { HttpRequest } from '../lib/models';
import { invokeCmd } from '../lib/tauri';
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
        return (await invokeCmd('cmd_list_http_requests', { workspaceId })) as HttpRequest[];
      },
    }).data ?? []
  );
}
