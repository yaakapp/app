import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { route } from 'preact-router';
import type { HttpRequest } from '../lib/models';
import { convertDates } from '../lib/models';
import { responsesQueryKey } from './useResponses';

export function requestsQueryKey(workspaceId: string) {
  return ['requests', { workspaceId }];
}

export function useRequests(workspaceId: string) {
  return useQuery({
    queryKey: requestsQueryKey(workspaceId),
    queryFn: async () => {
      const requests = (await invoke('requests', { workspaceId })) as HttpRequest[];
      return requests.map(convertDates);
    },
  });
}

export function useRequestUpdate(request: HttpRequest | null) {
  return useMutation<void, unknown, Partial<HttpRequest>>({
    mutationFn: async (patch) => {
      if (request == null) {
        throw new Error("Can't update a null request");
      }

      const updatedRequest = { ...request, ...patch } as any;

      // TODO: Figure out why this is necessary
      updatedRequest.createdAt = updatedRequest.createdAt.toISOString().replace('Z', '');
      updatedRequest.updatedAt = updatedRequest.updatedAt.toISOString().replace('Z', '');

      await invoke('update_request', { request: updatedRequest });
    },
  });
}

export function useRequestCreate({
  workspaceId,
  navigateAfter,
}: {
  workspaceId: string;
  navigateAfter: boolean;
}) {
  return useMutation<string, unknown, Pick<HttpRequest, 'name'>>({
    mutationFn: async (patch) => invoke('create_request', { ...patch, workspaceId }),
    onSuccess: async (requestId) => {
      console.log('DONE', { requestId, navigateAfter });
      if (navigateAfter) {
        route(`/workspaces/${workspaceId}/requests/${requestId}`);
      }
    },
  });
}

export function useSendRequest(request: HttpRequest | null) {
  const queryClient = useQueryClient();
  return useMutation<void, string>({
    mutationFn: async () => {
      if (request == null) return;
      await invoke('send_request', { requestId: request.id });
    },
    onSuccess: async () => {
      if (request == null) return;
      await queryClient.invalidateQueries(responsesQueryKey(request.id));
    },
  });
}

export function useDeleteRequest(request: HttpRequest | null) {
  const queryClient = useQueryClient();
  return useMutation<void, string>({
    mutationFn: async () => {
      if (request == null) return;
      await invoke('delete_request', { requestId: request.id });
    },
    onSuccess: async () => {
      if (request == null) return;
      await queryClient.invalidateQueries(requestsQueryKey(request.workspaceId));
    },
  });
}
