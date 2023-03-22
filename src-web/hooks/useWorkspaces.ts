import { invoke } from '@tauri-apps/api';
import type { Workspace } from '../lib/models';
import { useQuery } from '@tanstack/react-query';

export function workspacesQueryKey() {
  return ['workspaces'];
}

export function useWorkspaces() {
  return (
    useQuery(workspacesQueryKey(), async () => {
      return (await invoke('workspaces')) as Workspace[];
    }).data ?? []
  );
}
