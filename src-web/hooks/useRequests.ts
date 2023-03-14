import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { convertDates } from '../lib/models';
import { useActiveWorkspace } from './useActiveWorkspace';

export function requestsQueryKey(workspaceId: string) {
  return ['requests', { workspaceId }];
}

export function useRequests() {
  const workspace = useActiveWorkspace();
  return (
    useQuery({
      enabled: workspace != null,
      queryKey: requestsQueryKey(workspace?.id ?? 'n/a'),
      queryFn: async () => {
        if (workspace == null) return [];
        const requests = (await invoke('requests', { workspaceId: workspace.id })) as HttpRequest[];
        return requests.map(convertDates);
      },
    }).data ?? []
  );
}
