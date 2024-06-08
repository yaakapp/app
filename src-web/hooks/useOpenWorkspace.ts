import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import type { Workspace } from '../lib/models';
import { useAppRoutes } from './useAppRoutes';
import { getRecentEnvironments } from './useRecentEnvironments';
import { getRecentRequests } from './useRecentRequests';

export function useOpenWorkspace() {
  const routes = useAppRoutes();

  return useMutation({
    mutationFn: async ({
      workspace,
      inNewWindow,
    }: {
      workspace: Workspace;
      inNewWindow: boolean;
    }) => {
      if (workspace == null) return;

      if (inNewWindow) {
        const environmentId = (await getRecentEnvironments(workspace.id))[0];
        const requestId = (await getRecentRequests(workspace.id))[0];
        const path =
          requestId != null
            ? routes.paths.request({
                workspaceId: workspace.id,
                environmentId,
                requestId,
              })
            : routes.paths.workspace({ workspaceId: workspace.id, environmentId });
        await invoke('cmd_new_window', { url: path });
      } else {
        const environmentId = (await getRecentEnvironments(workspace.id))[0];
        const requestId = (await getRecentRequests(workspace.id))[0];
        if (requestId != null) {
          routes.navigate('request', {
            workspaceId: workspace.id,
            environmentId,
            requestId,
          });
        } else {
          routes.navigate('workspace', { workspaceId: workspace.id, environmentId });
        }
      }
    },
  });
}
