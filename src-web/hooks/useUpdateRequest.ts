import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { appWindow } from '@tauri-apps/api/window';
import type { HttpRequest } from '../lib/models';
import { getRequest } from '../lib/store';
import { requestsQueryKey } from './useRequests';

export function useUpdateRequest(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, Partial<HttpRequest> | ((r: HttpRequest) => HttpRequest)>({
    mutationFn: async (v) => {
      const request = await getRequest(id);
      if (request == null) {
        throw new Error("Can't update a null request");
      }

      const newRequest = typeof v === 'function' ? v(request) : { ...request, ...v };
      await invoke('update_request', { request: newRequest });
    },
    onMutate: async (v) => {
      const request = await getRequest(id);
      if (request === null) return;

      // Sync updatedBy so that the UI doesn't think the update is coming from elsewhere
      request.updatedBy = appWindow.label;

      const newRequest = typeof v === 'function' ? v(request) : { ...request, ...v };
      queryClient.setQueryData(
        requestsQueryKey(request?.workspaceId),
        (requests: HttpRequest[] | undefined) =>
          requests?.map((r) => (r.id === newRequest.id ? newRequest : r)),
      );
    },
  });
}
