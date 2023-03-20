import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { Workspace } from '../lib/models';
import { useRoutes } from './useRoutes';

export function useCreateWorkspace({ navigateAfter }: { navigateAfter: boolean }) {
  const routes = useRoutes();
  return useMutation<string, unknown, Pick<Workspace, 'name'>>({
    mutationFn: (patch) => {
      return invoke('create_workspace', patch);
    },
    onSuccess: async (workspaceId) => {
      if (navigateAfter) {
        routes.navigate('workspace', { workspaceId });
      }
    },
  });
}
