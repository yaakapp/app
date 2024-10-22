import { useMutation } from '@tanstack/react-query';
import type { HttpRequest } from '@yaakapp-internal/models';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';
import { useActiveEnvironment } from './useActiveEnvironment';
import { useActiveRequest } from './useActiveRequest';
import { useActiveWorkspace } from './useActiveWorkspace';
import { useAppRoutes } from './useAppRoutes';

export function useCreateHttpRequest() {
  const workspace = useActiveWorkspace();
  const [activeEnvironment] = useActiveEnvironment();
  const activeRequest = useActiveRequest();
  const routes = useAppRoutes();

  return useMutation<HttpRequest, unknown, Partial<HttpRequest>>({
    mutationKey: ['create_http_request'],
    mutationFn: async (patch = {}) => {
      if (workspace === null) {
        throw new Error("Cannot create request when there's no active workspace");
      }
      if (patch.sortPriority === undefined) {
        if (activeRequest != null) {
          // Place above currently-active request
          patch.sortPriority = activeRequest.sortPriority - 0.0001;
        } else {
          // Place at the very top
          patch.sortPriority = -Date.now();
        }
      }
      patch.folderId = patch.folderId || activeRequest?.folderId;
      const request = await invokeCmd<HttpRequest>('cmd_create_http_request', {
        request: { workspaceId: workspace.id, ...patch },
      });

      // Give some time for the workspace to sync to the local store
      await new Promise((resolve) => setTimeout(resolve, 100));

      return request;
    },
    onSettled: () => trackEvent('http_request', 'create'),
    onSuccess: async (request) => {
      routes.navigate('request', {
        workspaceId: request.workspaceId,
        requestId: request.id,
        environmentId: activeEnvironment?.id,
      });
    },
  });
}
