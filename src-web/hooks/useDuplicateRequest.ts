import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { requestsQueryKey } from './useRequests';
import { useRoutes } from './useRoutes';

export function useDuplicateRequest({
  id,
  navigateAfter,
}: {
  id: string | null;
  navigateAfter: boolean;
}) {
  const workspaceId = useActiveWorkspaceId();
  const routes = useRoutes();
  const queryClient = useQueryClient();
  return useMutation<HttpRequest, string>({
    mutationFn: async () => {
      if (id === null) throw new Error("Can't duplicate a null request");
      return invoke('duplicate_request', { id });
    },
    onSuccess: async (request) => {
      queryClient.setQueryData<HttpRequest[]>(
        requestsQueryKey({ workspaceId: request.workspaceId }),
        (requests) => [...(requests ?? []), request],
      );
      if (navigateAfter && workspaceId !== null) {
        routes.navigate('request', { workspaceId, requestId: request.id });
      }
    },
  });
}
