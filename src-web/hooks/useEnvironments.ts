import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import type { Environment } from '../lib/models';
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
        return (await invoke('cmd_list_environments', { workspaceId })) as Environment[];
      },
    }).data ?? []
  );
}
