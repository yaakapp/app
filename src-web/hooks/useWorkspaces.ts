import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import type { Workspace } from '../lib/models';

// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/ban-types
export function workspacesQueryKey(_?: {}) {
  return ['workspaces'];
}

export function useWorkspaces() {
  return (
    useQuery({
      queryKey: workspacesQueryKey(),
      queryFn: async () => {
        const workspaces = await invoke('cmd_list_workspaces');
        return workspaces as Workspace[];
      },
    }).data ?? []
  );
}
