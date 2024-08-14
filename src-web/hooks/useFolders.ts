import { useQuery } from '@tanstack/react-query';
import type { Folder } from '@yaakapp/api';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';

export function foldersQueryKey({ workspaceId }: { workspaceId: string }) {
  return ['folders', { workspaceId }];
}

export function useFolders() {
  const workspace = useActiveWorkspace();
  return (
    useQuery({
      enabled: workspace != null,
      queryKey: foldersQueryKey({ workspaceId: workspace?.id ?? 'n/a' }),
      queryFn: async () => {
        if (workspace == null) return [];
        return (await invokeCmd('cmd_list_folders', { workspaceId: workspace.id })) as Folder[];
      },
    }).data ?? []
  );
}
