import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { trackEvent } from '../lib/analytics';
import type { Folder } from '../lib/models';
import { useActiveRequest } from './useActiveRequest';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { foldersQueryKey } from './useFolders';
import { usePrompt } from './usePrompt';

export function useCreateFolder() {
  const workspaceId = useActiveWorkspaceId();
  const activeRequest = useActiveRequest();
  const queryClient = useQueryClient();
  const prompt = usePrompt();

  return useMutation<Folder, unknown, Partial<Pick<Folder, 'name' | 'sortPriority' | 'folderId'>>>({
    mutationFn: async (patch) => {
      if (workspaceId === null) {
        throw new Error("Cannot create folder when there's no active workspace");
      }
      patch.name =
        patch.name ||
        (await prompt({
          id: 'new-folder',
          name: 'name',
          label: 'Name',
          defaultValue: 'Folder',
          title: 'New Folder',
          confirmLabel: 'Create',
          placeholder: 'Name',
        }));
      patch.sortPriority = patch.sortPriority || -Date.now();
      patch.folderId = patch.folderId || activeRequest?.folderId;
      return invoke('cmd_create_folder', { workspaceId, ...patch });
    },
    onSettled: () => trackEvent('folder', 'create'),
    onSuccess: async (request) => {
      await queryClient.invalidateQueries({
        queryKey: foldersQueryKey({ workspaceId: request.workspaceId }),
      });
    },
  });
}
