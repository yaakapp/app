import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';

export function useUpdateRequest(request: HttpRequest | null) {
  return useMutation<void, unknown, Partial<HttpRequest>>({
    mutationFn: async (patch) => {
      if (request == null) {
        throw new Error("Can't update a null request");
      }

      const updatedRequest = { ...request, ...patch };

      await invoke('update_request', {
        request: {
          ...updatedRequest,
          createdAt: updatedRequest.createdAt.toISOString().replace('Z', ''),
          updatedAt: updatedRequest.updatedAt.toISOString().replace('Z', ''),
        },
      });
    },
  });
}
