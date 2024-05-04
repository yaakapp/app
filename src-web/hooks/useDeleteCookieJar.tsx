import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { InlineCode } from '../components/core/InlineCode';
import { trackEvent } from '../lib/analytics';
import type { CookieJar } from '../lib/models';
import { useConfirm } from './useConfirm';
import { cookieJarsQueryKey } from './useCookieJars';

export function useDeleteCookieJar(cookieJar: CookieJar | null) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  return useMutation<CookieJar | null, string>({
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
      return invoke('cmd_delete_cookie_jar', { cookieJarId: cookieJar?.id });
    },
    onSettled: () => trackEvent('cookie_jar', 'delete'),
    onSuccess: async (cookieJar) => {
      if (cookieJar === null) return;

      const { id: cookieJarId, workspaceId } = cookieJar;
      queryClient.setQueryData<CookieJar[]>(cookieJarsQueryKey({ workspaceId }), (cookieJars) =>
        cookieJars?.filter((e) => e.id !== cookieJarId),
      );
    },
  });
}
