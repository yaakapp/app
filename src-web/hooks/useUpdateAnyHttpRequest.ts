import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { HttpRequest } from '../lib/models';
import { getHttpRequest } from '../lib/store';
import { invokeCmd } from '../lib/tauri';
import { httpRequestsQueryKey } from './useHttpRequests';

export function useUpdateAnyHttpRequest() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    unknown,
    { id: string; update: Partial<HttpRequest> | ((r: HttpRequest) => HttpRequest) }
  >({
    mutationFn: async ({ id, update }) => {
      const request = await getHttpRequest(id);
      if (request === null) {
        throw new Error("Can't update a null request");
      }

      const patchedRequest =
        typeof update === 'function' ? update(request) : { ...request, ...update };
      await invokeCmd('cmd_update_http_request', { request: patchedRequest });
    },
    onMutate: async ({ id, update }) => {
      const request = await getHttpRequest(id);
      if (request === null) return;
      const patchedRequest =
        typeof update === 'function' ? update(request) : { ...request, ...update };
      queryClient.setQueryData<HttpRequest[]>(httpRequestsQueryKey(request), (requests) =>
        (requests ?? []).map((r) => (r.id === patchedRequest.id ? patchedRequest : r)),
      );
    },
  });
}
