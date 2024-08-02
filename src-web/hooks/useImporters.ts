import { useQuery } from '@tanstack/react-query';
import type { GetFileImportersResponse } from '../../plugin-runtime/src/gen/yaak/plugins/file_importer';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

export function useImporters() {
  const workspaceId = useActiveWorkspaceId();
  const importers = useQuery({
    queryKey: ['importers'],
    queryFn: async () => {
      const fileImporters: GetFileImportersResponse = await invokeCmd('cmd_get_file_importers');
      return fileImporters.fileImporters.map((fi) => ({
        ...fi,
        onImport: async (filePath: string) => {
          await invokeCmd('cmd_call_file_importer', {
            filePath,
            workspaceId,
            callback: fi.onImport,
          });
        },
      }));
    },
  });

  return { importers };
}
