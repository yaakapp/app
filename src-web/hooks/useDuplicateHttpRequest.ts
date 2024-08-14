import { useMutation } from '@tanstack/react-query';
import type { HttpRequest } from '@yaakapp/api';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useActiveWorkspace } from './useActiveWorkspace';
import { useAppRoutes } from './useAppRoutes';

export function useDuplicateHttpRequest({
  id,
  navigateAfter,
}: {
  id: string | null;
  navigateAfter: boolean;
}) {
  const activeWorkspace = useActiveWorkspace();
  const [activeEnvironmentId] = useActiveEnvironmentId();
  const routes = useAppRoutes();
  return useMutation<HttpRequest, string>({
    mutationKey: ['duplicate_http_request', id],
    mutationFn: async () => {
      if (id === null) throw new Error("Can't duplicate a null request");
      return invokeCmd('cmd_duplicate_http_request', { id });
    },
    onSettled: () => trackEvent('http_request', 'duplicate'),
    onSuccess: async (request) => {
      if (navigateAfter && activeWorkspace !== null) {
        routes.navigate('request', {
          workspaceId: activeWorkspace.id,
          requestId: request.id,
          environmentId: activeEnvironmentId ?? undefined,
        });
      }
    },
  });
}
