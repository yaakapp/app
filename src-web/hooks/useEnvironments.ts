import { useQuery } from '@tanstack/react-query';
import type { Environment } from '@yaakapp/api';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';

export function environmentsQueryKey({ workspaceId }: { workspaceId: string }) {
  return ['environments', { workspaceId }];
}

export function useEnvironments() {
  const workspace = useActiveWorkspace();
  return (
    useQuery({
      enabled: workspace != null,
      queryKey: environmentsQueryKey({ workspaceId: workspace?.id ?? 'n/a' }),
      queryFn: async () => {
        if (workspace == null) return [];
        return (await invokeCmd('cmd_list_environments', {
          workspaceId: workspace.id,
        })) as Environment[];
      },
    }).data ?? []
  );
}
