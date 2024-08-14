import { useMutation } from '@tanstack/react-query';
import type { Folder } from '@yaakapp/api';
import { getFolder } from '../lib/store';
import { invokeCmd } from '../lib/tauri';

export function useUpdateAnyFolder() {
  return useMutation<void, unknown, { id: string; update: (r: Folder) => Folder }>({
    mutationKey: ['update_any_folder'],
    mutationFn: async ({ id, update }) => {
      const folder = await getFolder(id);
      if (folder === null) {
        throw new Error("Can't update a null folder");
      }

      await invokeCmd('cmd_update_folder', { folder: update(folder) });
    },
  });
}
