import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { useAppRoutes } from './useAppRoutes';
import { getRecentEnvironments } from './useRecentEnvironments';
import { getRecentRequests } from './useRecentRequests';

export function useOpenWorkspace() {
  const routes = useAppRoutes();

  return useMutation({
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
        const path =
          requestId != null
            ? routes.paths.request({
                workspaceId,
                environmentId,
                requestId,
              })
            : routes.paths.workspace({ workspaceId, environmentId });
        await invoke('cmd_new_window', { url: path });
      } else {
        const environmentId = (await getRecentEnvironments(workspaceId))[0];
        const requestId = (await getRecentRequests(workspaceId))[0];
        if (requestId != null) {
          routes.navigate('request', {
            workspaceId: workspaceId,
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
