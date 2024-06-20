import { useQuery } from '@tanstack/react-query';
import type { Folder } from '../lib/models';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

export function foldersQueryKey({ workspaceId }: { workspaceId: string }) {
  return ['folders', { workspaceId }];
}

export function useFolders() {
  const workspaceId = useActiveWorkspaceId();
  return (
    useQuery({
      enabled: workspaceId != null,
      queryKey: foldersQueryKey({ workspaceId: workspaceId ?? 'n/a' }),
      queryFn: async () => {
        if (workspaceId == null) return [];
        return (await invokeCmd('cmd_list_folders', { workspaceId })) as Folder[];
      },
    }).data ?? []
  );
}
