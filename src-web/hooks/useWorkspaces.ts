import { invoke } from '@tauri-apps/api';
import type { Workspace } from '../lib/models';
import { convertDates } from '../lib/models';
import { useQuery } from '@tanstack/react-query';

export function useWorkspaces() {
  return (
    useQuery(['workspaces'], async () => {
      console.log('INVOKING WORKSPACES');
      const workspaces = (await invoke('workspaces')) as Workspace[];
      return workspaces.map(convertDates);
    }).data ?? []
  );
}
