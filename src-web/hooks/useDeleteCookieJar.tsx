import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { InlineCode } from '../components/core/InlineCode';
import { trackEvent } from '../lib/analytics';
import type { CookieJar, Workspace } from '../lib/models';
import { useConfirm } from './useConfirm';
import { cookieJarsQueryKey } from './useCookieJars';

export function useDeleteCookieJar(cookieJar: CookieJar | null) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  return useMutation<CookieJar | null, string>({
    mutationFn: async () => {
      const confirmed = await confirm({
        title: 'Delete CookieJar',
        variant: 'delete',
        description: (
          <>
            Permanently delete <InlineCode>{cookieJar?.name}</InlineCode>?
          </>
        ),
      });
      if (!confirmed) return null;
      return invoke('delete_cookie_jar', { cookieJarId: cookieJar?.id });
    },
    onSettled: () => trackEvent('CookieJar', 'Delete'),
    onSuccess: async (cookieJar) => {
      if (cookieJar === null) return;

      const { id: cookieJarId, workspaceId } = cookieJar;
      queryClient.setQueryData<CookieJar[]>(cookieJarsQueryKey({ workspaceId }), (cookieJars) =>
        cookieJars?.filter((e) => e.id !== cookieJarId),
      );
    },
  });
}
