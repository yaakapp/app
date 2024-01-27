import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { trackEvent } from '../lib/analytics';
import type { HttpRequest } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { requestsQueryKey } from './useRequests';

export function useCreateCookieJar() {
  const workspaceId = useActiveWorkspaceId();
  const queryClient = useQueryClient();

  return useMutation<HttpRequest>({
    mutationFn: () => {
      if (workspaceId === null) {
        throw new Error("Cannot create cookie jar when there's no active workspace");
      }
      return invoke('create_cookie_jar', { workspaceId });
    },
    onSettled: () => trackEvent('CookieJar', 'Create'),
    onSuccess: async (request) => {
      queryClient.setQueryData<HttpRequest[]>(
        requestsQueryKey({ workspaceId: request.workspaceId }),
        (requests) => [...(requests ?? []), request],
      );
    },
  });
}
