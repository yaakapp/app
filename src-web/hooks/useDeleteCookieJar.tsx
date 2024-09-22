import { useMutation } from '@tanstack/react-query';
import type { CookieJar } from '@yaakapp-internal/models';
import { InlineCode } from '../components/core/InlineCode';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';
import { useConfirm } from './useConfirm';

export function useDeleteCookieJar(cookieJar: CookieJar | null) {
  const confirm = useConfirm();

  return useMutation<CookieJar | null, string>({
    mutationKey: ['delete_cookie_jar', cookieJar?.id],
    mutationFn: async () => {
      const confirmed = await confirm({
        id: 'delete-cookie-jar',
        title: 'Delete CookieJar',
        variant: 'delete',
        description: (
          <>
            Permanently delete <InlineCode>{cookieJar?.name}</InlineCode>?
          </>
        ),
      });
      if (!confirmed) return null;
      return invokeCmd('cmd_delete_cookie_jar', { cookieJarId: cookieJar?.id });
    },
    onSettled: () => trackEvent('cookie_jar', 'delete'),
  });
}
