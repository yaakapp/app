import { useMutation } from '@tanstack/react-query';
import type { Workspace } from '@yaakapp-internal/models';
import { getWorkspace } from '../lib/store';
import { invokeCmd } from '../lib/tauri';

export function useUpdateWorkspace(id: string | null) {
  return useMutation<void, unknown, Partial<Workspace> | ((w: Workspace) => Workspace)>({
    mutationKey: ['update_workspace', id],
    mutationFn: async (v) => {
      const workspace = await getWorkspace(id);
      if (workspace == null) {
        throw new Error("Can't update a null workspace");
      }

      const newWorkspace = typeof v === 'function' ? v(workspace) : { ...workspace, ...v };
      await invokeCmd('cmd_update_workspace', { workspace: newWorkspace });
    },
  });
}
