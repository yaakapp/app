import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { OpenDialogOptions } from '@tauri-apps/api/dialog';
import { open } from '@tauri-apps/api/dialog';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

const openArgs: OpenDialogOptions = {
  directory: true,
  multiple: false,
  title: 'Select Export Folder',
};

export function useExportData() {
  const workspaceId = useActiveWorkspaceId();

  return useMutation({
    mutationFn: async () => {
      const selected = await open(openArgs);
      if (selected == null) {
        return;
      }

      const rootDir = Array.isArray(selected) ? selected[0] : selected;
      if (rootDir == null) {
        return;
      }

      await invoke('export_data', { workspaceId, rootDir });
    },
  });
}
