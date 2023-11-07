import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { trackEvent } from '../lib/analytics';
import type { HttpRequest } from '../lib/models';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useAppRoutes } from './useAppRoutes';
import { requestsQueryKey } from './useRequests';

export function useDuplicateRequest({
  id,
  navigateAfter,
}: {
  id: string | null;
  navigateAfter: boolean;
}) {
  const activeWorkspaceId = useActiveWorkspaceId();
  const activeEnvironmentId = useActiveEnvironmentId();
  const routes = useAppRoutes();
  const queryClient = useQueryClient();
  return useMutation<HttpRequest, string>({
    mutationFn: async () => {
      if (id === null) throw new Error("Can't duplicate a null request");
      return invoke('duplicate_request', { id });
    },
    onSettled: () => trackEvent('http_request', 'duplicate'),
    onSuccess: async (request) => {
      queryClient.setQueryData<HttpRequest[]>(
        requestsQueryKey({ workspaceId: request.workspaceId }),
        (requests) => [...(requests ?? []), request],
      );
      if (navigateAfter && activeWorkspaceId !== null) {
        routes.navigate('request', {
          workspaceId: activeWorkspaceId,
          requestId: request.id,
          environmentId: activeEnvironmentId ?? undefined,
        });
      }
    },
  });
}
