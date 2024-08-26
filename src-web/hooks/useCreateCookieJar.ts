import { useMutation } from '@tanstack/react-query';
import type { CookieJar } from '@yaakapp/api';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';
import { usePrompt } from './usePrompt';

export function useCreateCookieJar() {
  const workspace = useActiveWorkspace();
  const prompt = usePrompt();

  return useMutation<CookieJar>({
    mutationKey: ['create_cookie_jar'],
    mutationFn: async () => {
      if (workspace === null) {
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
      return invokeCmd('cmd_create_cookie_jar', { workspaceId: workspace.id, name });
    },
    onSettled: () => trackEvent('cookie_jar', 'create'),
  });
}
