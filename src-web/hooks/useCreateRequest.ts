import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { useActiveWorkspace } from './useActiveWorkspace';
import { useRequests } from './useRequests';
import { useRoutes } from './useRoutes';

export function useCreateRequest({ navigateAfter }: { navigateAfter: boolean }) {
  const workspace = useActiveWorkspace();
  const routes = useRoutes();
  const requests = useRequests();

  return useMutation<string, unknown, Partial<Pick<HttpRequest, 'name' | 'sortPriority'>>>({
    mutationFn: (patch) => {
      if (workspace === null) {
        throw new Error("Cannot create request when there's no active workspace");
      }
      const sortPriority = maxSortPriority(requests) + 1000;
      return invoke('create_request', { sortPriority, workspaceId: workspace.id, ...patch });
    },
    onSuccess: async (requestId) => {
      if (navigateAfter && workspace !== null) {
        routes.navigate('request', { workspaceId: workspace.id, requestId });
      }
    },
  });
}

function maxSortPriority(requests: HttpRequest[]) {
  if (requests.length === 0) return 1000;
  return Math.max(...requests.map((r) => r.sortPriority));
}
