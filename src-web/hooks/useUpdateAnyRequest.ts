import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { getRequest } from '../lib/store';
import { requestsQueryKey } from './useRequests';

export function useUpdateAnyRequest() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, { id: string; update: (r: HttpRequest) => HttpRequest }>({
    mutationFn: async ({ id, update }) => {
      const request = await getRequest(id);
      if (request === null) {
        throw new Error("Can't update a null request");
      }

      await invoke('update_request', { request: update(request) });
    },
    onMutate: async ({ id, update }) => {
      const request = await getRequest(id);
      if (request === null) return;
      queryClient.setQueryData<HttpRequest[]>(requestsQueryKey(request), (requests) =>
        (requests ?? []).map((r) => (r.id === request.id ? update(r) : r)),
      );
    },
  });
}
