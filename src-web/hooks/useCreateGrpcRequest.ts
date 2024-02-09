import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { trackEvent } from '../lib/analytics';
import type { GrpcRequest } from '../lib/models';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useAppRoutes } from './useAppRoutes';
import { grpcRequestsQueryKey } from './useGrpcRequests';

export function useCreateGrpcRequest() {
  const workspaceId = useActiveWorkspaceId();
  const activeEnvironmentId = useActiveEnvironmentId();
  // const activeRequest = useActiveRequest();
  const activeRequest = null;
  const routes = useAppRoutes();
  const queryClient = useQueryClient();

  return useMutation<
    GrpcRequest,
    unknown,
    Partial<Pick<GrpcRequest, 'name' | 'sortPriority' | 'folderId'>>
  >({
    mutationFn: (patch) => {
      if (workspaceId === null) {
        throw new Error("Cannot create grpc request when there's no active workspace");
      }
      if (patch.sortPriority === undefined) {
        if (activeRequest != null) {
          // Place above currently-active request
          // patch.sortPriority = activeRequest.sortPriority + 0.0001;
        } else {
          // Place at the very top
          patch.sortPriority = -Date.now();
        }
      }
      // patch.folderId = patch.folderId; // TODO: || activeRequest?.folderId;
      return invoke('cmd_create_grpc_request', { workspaceId, name: '', ...patch });
    },
    onSettled: () => trackEvent('GrpcRequest', 'Create'),
    onSuccess: async (request) => {
      queryClient.setQueryData<GrpcRequest[]>(
        grpcRequestsQueryKey({ workspaceId: request.workspaceId }),
        (requests) => [...(requests ?? []), request],
      );
      // TODO: This should navigate to the new request
      routes.navigate('request', {
        workspaceId: request.workspaceId,
        requestId: request.id,
        environmentId: activeEnvironmentId ?? undefined,
      });
    },
  });
}
