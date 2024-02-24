import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { trackEvent } from '../lib/analytics';
import type { Folder } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { foldersQueryKey } from './useFolders';

export function useCreateFolder() {
  const workspaceId = useActiveWorkspaceId();
  const queryClient = useQueryClient();

  return useMutation<Folder, unknown, Partial<Pick<Folder, 'name' | 'sortPriority' | 'folderId'>>>({
    mutationFn: (patch) => {
      if (workspaceId === null) {
        throw new Error("Cannot create folder when there's no active workspace");
      }
      patch.name = patch.name || 'New Folder';
      patch.sortPriority = patch.sortPriority || -Date.now();
      return invoke('cmd_create_folder', { workspaceId, ...patch });
    },
    onSettled: () => trackEvent('folder', 'create'),
    onSuccess: async (request) => {
      await queryClient.invalidateQueries(foldersQueryKey({ workspaceId: request.workspaceId }));
    },
  });
}
