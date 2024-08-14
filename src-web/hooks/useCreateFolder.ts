import { useMutation, useQueryClient } from '@tanstack/react-query';
import { trackEvent } from '../lib/analytics';
import type { Folder } from '@yaakapp/api';
import { invokeCmd } from '../lib/tauri';
import { useActiveRequest } from './useActiveRequest';
import { useActiveWorkspace } from './useActiveWorkspace';
import { foldersQueryKey } from './useFolders';
import { usePrompt } from './usePrompt';

export function useCreateFolder() {
  const workspace = useActiveWorkspace();
  const activeRequest = useActiveRequest();
  const queryClient = useQueryClient();
  const prompt = usePrompt();

  return useMutation<Folder, unknown, Partial<Pick<Folder, 'name' | 'sortPriority' | 'folderId'>>>({
    mutationKey: ['create_folder'],
    mutationFn: async (patch) => {
      if (workspace === null) {
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
      return invokeCmd('cmd_create_folder', { workspaceId: workspace.id, ...patch });
    },
    onSettled: () => trackEvent('folder', 'create'),
    onSuccess: async (request) => {
      await queryClient.invalidateQueries({
        queryKey: foldersQueryKey({ workspaceId: request.workspaceId }),
      });
    },
  });
}
