import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { Folder, HttpRequest } from '../lib/models';
import { getFolder, getRequest } from '../lib/store';
import { requestsQueryKey } from './useRequests';
import { foldersQueryKey } from './useFolders';

export function useUpdateAnyFolder() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, { id: string; update: (r: Folder) => Folder }>({
    mutationFn: async ({ id, update }) => {
      const folder = await getFolder(id);
      if (folder === null) {
        throw new Error("Can't update a null folder");
      }

      await invoke('update_folder', { folder: update(folder) });
    },
    onMutate: async ({ id, update }) => {
      const folder = await getFolder(id);
      if (folder === null) return;
      queryClient.setQueryData<Folder[]>(foldersQueryKey(folder), (folders) =>
        (folders ?? []).map((f) => (f.id === folder.id ? update(f) : f)),
      );
    },
  });
}
