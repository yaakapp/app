import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { getRequest } from '../lib/store';

export function useUpdateAnyRequest() {
  return useMutation<void, unknown, Partial<HttpRequest> & { id: string }>({
    mutationFn: async (patch) => {
      const request = await getRequest(patch.id);
      if (request === null) {
        throw new Error("Can't update a null request");
      }

      const updatedRequest = { ...request, ...patch };
      await invoke('update_request', { request: updatedRequest });
    },
  });
}
