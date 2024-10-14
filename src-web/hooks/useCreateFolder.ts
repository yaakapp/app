import { useMutation } from '@tanstack/react-query';
import type { Folder } from '@yaakapp-internal/models';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';
import { usePrompt } from './usePrompt';

export function useCreateFolder() {
  const workspace = useActiveWorkspace();
  const prompt = usePrompt();

  return useMutation<void, unknown, Partial<Pick<Folder, 'name' | 'sortPriority' | 'folderId'>>>({
    mutationKey: ['create_folder'],
    mutationFn: async (patch) => {
      if (workspace === null) {
        throw new Error("Cannot create folder when there's no active workspace");
      }

      if (!patch.name) {
        const name = await prompt({
          id: 'new-folder',
          label: 'Name',
          defaultValue: 'Folder',
          title: 'New Folder',
          confirmText: 'Create',
          placeholder: 'Name',
        });
        if (name == null) {
          return;
        }
        patch.name = name;
      }

      patch.sortPriority = patch.sortPriority || -Date.now();
      await invokeCmd('cmd_create_folder', { workspaceId: workspace.id, ...patch });
    },
    onSettled: () => trackEvent('folder', 'create'),
  });
}
