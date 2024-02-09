import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { Workspace } from '../lib/models';

// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/ban-types
export function workspacesQueryKey(_?: {}) {
  return ['workspaces'];
}

export function useWorkspaces() {
  return (
    useQuery(workspacesQueryKey(), async () => {
      return (await invoke('cmd_list_workspaces')) as Workspace[];
    }).data ?? []
  );
}
