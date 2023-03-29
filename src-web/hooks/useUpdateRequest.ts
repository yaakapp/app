import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { getRequest } from '../lib/store';
import { requestsQueryKey } from './useRequests';

export function useUpdateRequest(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, Partial<HttpRequest>>({
    mutationFn: async (patch) => {
      const request = await getRequest(id);
      if (request == null) {
        throw new Error("Can't update a null request");
      }

      const updatedRequest = { ...request, ...patch };

      console.log('UPDATING REQUEST', patch);
      await invoke('update_request', {
        request: updatedRequest,
      });
    },
    onMutate: async (patch) => {
      const request = await getRequest(id);
      if (request === null) return;
      queryClient.setQueryData(
        requestsQueryKey(request?.workspaceId),
        (requests: HttpRequest[] | undefined) =>
          requests?.map((r) => (r.id === request.id ? { ...r, ...patch } : r)),
      );
    },
  });
}
