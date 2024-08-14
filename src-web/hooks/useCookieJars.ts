import { useQuery } from '@tanstack/react-query';
import type { CookieJar } from '../lib/models';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';

export function cookieJarsQueryKey({ workspaceId }: { workspaceId: string }) {
  return ['cookie_jars', { workspaceId }];
}

export function useCookieJars() {
  const workspace = useActiveWorkspace();
  return useQuery({
    enabled: workspace != null,
    queryKey: cookieJarsQueryKey({ workspaceId: workspace?.id ?? 'n/a' }),
    queryFn: async () => {
      if (workspace == null) return [];
      return (await invokeCmd('cmd_list_cookie_jars', {
        workspaceId: workspace.id,
      })) as CookieJar[];
    },
  });
}
