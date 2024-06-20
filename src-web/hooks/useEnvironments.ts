import { useQuery } from '@tanstack/react-query';
import type { Environment } from '../lib/models';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

export function environmentsQueryKey({ workspaceId }: { workspaceId: string }) {
  return ['environments', { workspaceId }];
}

export function useEnvironments() {
  const workspaceId = useActiveWorkspaceId();
  return (
    useQuery({
      enabled: workspaceId != null,
      queryKey: environmentsQueryKey({ workspaceId: workspaceId ?? 'n/a' }),
      queryFn: async () => {
        if (workspaceId == null) return [];
        return (await invokeCmd('cmd_list_environments', { workspaceId })) as Environment[];
      },
    }).data ?? []
  );
}
