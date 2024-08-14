import { useQuery } from '@tanstack/react-query';
import type { HttpRequest } from '@yaakapp/api';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';

export function httpRequestsQueryKey({ workspaceId }: { workspaceId: string }) {
  return ['http_requests', { workspaceId }];
}

export function useHttpRequests() {
  const workspace = useActiveWorkspace();
  return (
    useQuery({
      enabled: workspace != null,
      queryKey: httpRequestsQueryKey({ workspaceId: workspace?.id ?? 'n/a' }),
      queryFn: async () => {
        if (workspace == null) return [];
        return (await invokeCmd('cmd_list_http_requests', {
          workspaceId: workspace.id,
        })) as HttpRequest[];
      },
    }).data ?? []
  );
}
