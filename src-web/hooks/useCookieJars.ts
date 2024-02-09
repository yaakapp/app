import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { CookieJar } from '../lib/models';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

export function cookieJarsQueryKey({ workspaceId }: { workspaceId: string }) {
  return ['cookie_jars', { workspaceId }];
}

export function useCookieJars() {
  const workspaceId = useActiveWorkspaceId();
  return (
    useQuery({
      enabled: workspaceId != null,
      queryKey: cookieJarsQueryKey({ workspaceId: workspaceId ?? 'n/a' }),
      queryFn: async () => {
        if (workspaceId == null) return [];
        return (await invoke('cmd_list_cookie_jars', { workspaceId })) as CookieJar[];
      },
    }).data ?? []
  );
}
