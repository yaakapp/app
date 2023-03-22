import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { useActiveWorkspace } from './useActiveWorkspace';
import { useRoutes } from './useRoutes';

export function useCreateRequest({ navigateAfter }: { navigateAfter: boolean }) {
  const workspace = useActiveWorkspace();
  const routes = useRoutes();

  return useMutation<string, unknown, Pick<HttpRequest, 'name' | 'sortPriority'>>({
    mutationFn: (patch) => {
      if (workspace === null) {
        throw new Error("Cannot create request when there's no active workspace");
      }
      return invoke('create_request', { ...patch, workspaceId: workspace.id });
    },
    onSuccess: async (requestId) => {
      if (navigateAfter && workspace !== null) {
        routes.navigate('request', { workspaceId: workspace.id, requestId });
      }
    },
  });
}
