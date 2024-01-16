import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { trackEvent } from '../lib/analytics';
import type { HttpRequest } from '../lib/models';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useActiveRequest } from './useActiveRequest';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useAppRoutes } from './useAppRoutes';
import { requestsQueryKey } from './useRequests';

export function useCreateRequest() {
  const workspaceId = useActiveWorkspaceId();
  const activeEnvironmentId = useActiveEnvironmentId();
  const activeRequest = useActiveRequest();
  const routes = useAppRoutes();
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
      if (patch.sortPriority === undefined) {
        if (activeRequest != null) {
          // Place above currently-active request
          patch.sortPriority = activeRequest.sortPriority + 0.0001;
        } else {
          // Place at the very top
          patch.sortPriority = -Date.now();
        }
      }
      patch.folderId = patch.folderId || activeRequest?.folderId;
      return invoke('create_request', { workspaceId, name: '', ...patch });
    },
    onSettled: () => trackEvent('HttpRequest', 'Create'),
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
