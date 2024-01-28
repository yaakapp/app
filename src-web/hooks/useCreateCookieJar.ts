import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { trackEvent } from '../lib/analytics';
import type { CookieJar, HttpRequest } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { usePrompt } from './usePrompt';
import { requestsQueryKey } from './useRequests';

export function useCreateCookieJar() {
  const workspaceId = useActiveWorkspaceId();
  const queryClient = useQueryClient();
  const prompt = usePrompt();

  return useMutation<HttpRequest>({
    mutationFn: async () => {
      if (workspaceId === null) {
        throw new Error("Cannot create cookie jar when there's no active workspace");
      }
      const name = await prompt({
        name: 'name',
        title: 'New CookieJar',
        label: 'Name',
        defaultValue: 'My Jar',
      });
      return invoke('create_cookie_jar', { workspaceId, name });
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
