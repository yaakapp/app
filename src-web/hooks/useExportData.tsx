import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { SaveDialogOptions } from '@tauri-apps/api/dialog';
import { save } from '@tauri-apps/api/dialog';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

const saveArgs: SaveDialogOptions = {
  title: 'Export Data',
  defaultPath: 'yaak-export.json',
};

export function useExportData() {
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: async () => {
      const rootDir = await save(saveArgs);
      if (rootDir == null) {
        return;
      }

      await invoke('export_data', { workspaceId, rootDir });
    },
  });
}
