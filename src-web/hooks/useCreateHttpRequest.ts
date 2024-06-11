import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { trackEvent } from '../lib/analytics';
import type { HttpRequest } from '../lib/models';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useActiveRequest } from './useActiveRequest';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useAppRoutes } from './useAppRoutes';

export function useCreateHttpRequest() {
  const workspaceId = useActiveWorkspaceId();
  const activeEnvironmentId = useActiveEnvironmentId();
  const activeRequest = useActiveRequest();
  const routes = useAppRoutes();

  return useMutation<HttpRequest, unknown, Partial<HttpRequest>>({
    mutationFn: (patch = {}) => {
      if (workspaceId === null) {
        throw new Error("Cannot create request when there's no active workspace");
      }
      if (patch.sortPriority === undefined) {
        if (activeRequest != null) {
          // Place above currently-active request
          patch.sortPriority = activeRequest.sortPriority + 0.0001;
        } else {
          // Place at the very top
          patch.sortPriority = -Date.now();
        }
      }
      patch.folderId = patch.folderId || activeRequest?.folderId;
      return invoke('cmd_create_http_request', { request: { workspaceId, ...patch } });
    },
    onSettled: () => trackEvent('http_request', 'create'),
    onSuccess: async (request) => {
      routes.navigate('request', {
        workspaceId: request.workspaceId,
        requestId: request.id,
        environmentId: activeEnvironmentId ?? undefined,
      });
    },
  });
}
