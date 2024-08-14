import { useMutation } from '@tanstack/react-query';
import { invokeCmd } from '../lib/tauri';
import { useAppRoutes } from './useAppRoutes';
import { getRecentCookieJars } from './useRecentCookieJars';
import { getRecentEnvironments } from './useRecentEnvironments';
import { getRecentRequests } from './useRecentRequests';

export function useOpenWorkspace() {
  const routes = useAppRoutes();

  return useMutation({
    mutationKey: ['open_workspace'],
    mutationFn: async ({
      workspaceId,
      inNewWindow,
    }: {
      workspaceId: string;
      inNewWindow: boolean;
    }) => {
      if (inNewWindow) {
        const environmentId = (await getRecentEnvironments(workspaceId))[0];
        const requestId = (await getRecentRequests(workspaceId))[0];
        const cookieJarId = (await getRecentCookieJars(workspaceId))[0];
        const path =
          requestId != null
            ? routes.paths.request({
                workspaceId,
                environmentId,
                cookieJarId,
                requestId,
              })
            : routes.paths.workspace({ workspaceId, environmentId });
        await invokeCmd('cmd_new_window', { url: path });
      } else {
        const environmentId = (await getRecentEnvironments(workspaceId))[0];
        const requestId = (await getRecentRequests(workspaceId))[0];
        const cookieJarId = (await getRecentCookieJars(workspaceId))[0];
        if (requestId != null) {
          routes.navigate('request', {
            workspaceId,
            cookieJarId,
            environmentId,
            requestId,
          });
        } else {
          routes.navigate('workspace', { workspaceId, environmentId });
        }
      }
    },
  });
}
