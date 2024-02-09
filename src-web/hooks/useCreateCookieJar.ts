import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { trackEvent } from '../lib/analytics';
import type { CookieJar } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { cookieJarsQueryKey } from './useCookieJars';
import { usePrompt } from './usePrompt';

export function useCreateCookieJar() {
  const workspaceId = useActiveWorkspaceId();
  const queryClient = useQueryClient();
  const prompt = usePrompt();

  return useMutation<CookieJar>({
    mutationFn: async () => {
      if (workspaceId === null) {
        throw new Error("Cannot create cookie jar when there's no active workspace");
      }
      const name = await prompt({
        id: 'new-cookie-jar',
        name: 'name',
        title: 'New CookieJar',
        placeholder: 'My Jar',
        label: 'Name',
        defaultValue: 'My Jar',
      });
      return invoke('cmd_create_cookie_jar', { workspaceId, name });
    },
    onSettled: () => trackEvent('CookieJar', 'Create'),
    onSuccess: async (cookieJar) => {
      queryClient.setQueryData<CookieJar[]>(
        cookieJarsQueryKey({ workspaceId: cookieJar.workspaceId }),
        (items) => [...(items ?? []), cookieJar],
      );
    },
  });
}
