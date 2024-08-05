import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Workspace } from '@yaakapp/api';
import { getWorkspace } from '../lib/store';
import { invokeCmd } from '../lib/tauri';
import { workspacesQueryKey } from './useWorkspaces';

export function useUpdateWorkspace(id: string | null) {
  const queryClient = useQueryClient();
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
    onMutate: async (v) => {
      const workspace = await getWorkspace(id);
      if (workspace === null) return;

      const newWorkspace = typeof v === 'function' ? v(workspace) : { ...workspace, ...v };
      queryClient.setQueryData<Workspace[]>(workspacesQueryKey(workspace), (workspaces) =>
        (workspaces ?? []).map((w) => (w.id === newWorkspace.id ? newWorkspace : w)),
      );
    },
  });
}
