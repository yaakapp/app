import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { Folder, HttpRequest } from '../lib/models';
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
        return (await invoke('list_folders', { workspaceId })) as Folder[];
      },
    }).data ?? []
  );
}
