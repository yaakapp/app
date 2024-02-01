import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { save } from '@tauri-apps/api/dialog';
import slugify from 'slugify';
import { useActiveWorkspace } from './useActiveWorkspace';
import { useAlert } from './useAlert';

export function useExportData() {
  const workspace = useActiveWorkspace();
  const alert = useAlert();

  return useMutation({
    onError: (err: string) => {
      alert({ id: 'export-failed', title: 'Export Failed', body: err });
    },
    mutationFn: async () => {
      if (workspace == null) return;

      const workspaceSlug = slugify(workspace.name, { lower: true });
      const exportPath = await save({
        title: 'Export Data',
        defaultPath: `yaak.${workspaceSlug}.json`,
      });
      if (exportPath == null) {
        return;
      }

      await invoke('cmd_export_data', { workspaceId: workspace.id, exportPath });
    },
  });
}
