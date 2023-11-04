import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useAppRoutes } from './useAppRoutes';
import { requestsQueryKey, useRequests } from './useRequests';

export function useCreateRequest() {
  const workspaceId = useActiveWorkspaceId();
  const activeEnvironmentId = useActiveEnvironmentId();
  const routes = useAppRoutes();
  const requests = useRequests();
  const queryClient = useQueryClient();

  return useMutation<
    HttpRequest,
    unknown,
    Partial<Pick<HttpRequest, 'name' | 'sortPriority' | 'folderId'>>
  >({
    mutationFn: (patch) => {
      if (workspaceId === null) {
        throw new Error("Cannot create request when there's no active workspace");
      }
      patch.name = patch.name || 'New Request';
      patch.sortPriority = patch.sortPriority || maxSortPriority(requests) + 1000;
      return invoke('create_request', { workspaceId, ...patch });
    },
    onSuccess: async (request) => {
      queryClient.setQueryData<HttpRequest[]>(
        requestsQueryKey({ workspaceId: request.workspaceId }),
        (requests) => [...(requests ?? []), request],
      );
      routes.navigate('request', {
        workspaceId: request.workspaceId,
        requestId: request.id,
        environmentId: activeEnvironmentId ?? undefined,
      });
    },
  });
}

function maxSortPriority(requests: HttpRequest[]) {
  if (requests.length === 0) return 1000;
  return Math.max(...requests.map((r) => r.sortPriority));
}
