import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { getRequest } from '../lib/store';
import { requestsQueryKey } from './useRequests';

export function useUpdateAnyRequest() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    unknown,
    { id: string; update: Partial<HttpRequest> | ((r: HttpRequest) => HttpRequest) }
  >({
    mutationFn: async ({ id, update }) => {
      const request = await getRequest(id);
      if (request === null) {
        throw new Error("Can't update a null request");
      }

      const patchedRequest =
        typeof update === 'function' ? update(request) : { ...request, ...update };
      await invoke('cmd_update_request', { request: patchedRequest });
    },
    onMutate: async ({ id, update }) => {
      const request = await getRequest(id);
      if (request === null) return;
      const patchedRequest =
        typeof update === 'function' ? update(request) : { ...request, ...update };
      queryClient.setQueryData<HttpRequest[]>(requestsQueryKey(request), (requests) =>
        (requests ?? []).map((r) => (r.id === patchedRequest.id ? patchedRequest : r)),
      );
    },
  });
}
