import { useMutation } from '@tanstack/react-query';
import { trackEvent } from '../lib/analytics';
import type { CookieJar } from '../lib/models';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { usePrompt } from './usePrompt';

export function useCreateCookieJar() {
  const workspaceId = useActiveWorkspaceId();
  const prompt = usePrompt();

  return useMutation<CookieJar>({
    mutationKey: ['create_cookie_jar'],
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
      return invokeCmd('cmd_create_cookie_jar', { workspaceId, name });
    },
    onSettled: () => trackEvent('cookie_jar', 'create'),
  });
}
