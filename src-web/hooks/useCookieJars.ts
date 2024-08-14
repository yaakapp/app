import { useQuery } from '@tanstack/react-query';
import type { CookieJar } from '../lib/models';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

export function cookieJarsQueryKey({ workspaceId }: { workspaceId: string }) {
  return ['cookie_jars', { workspaceId }];
}

export function useCookieJars() {
  const workspaceId = useActiveWorkspaceId();
  return useQuery({
    enabled: workspaceId != null,
    queryKey: cookieJarsQueryKey({ workspaceId: workspaceId ?? 'n/a' }),
    queryFn: async () => {
      if (workspaceId == null) return [];
      return (await invokeCmd('cmd_list_cookie_jars', { workspaceId })) as CookieJar[];
    },
  });
}
