import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { HttpRequest } from '../lib/models';
import { useRequests } from './useRequests';

export function useUpdateAnyRequest() {
  const requests = useRequests();
  return useMutation<void, unknown, Partial<HttpRequest> & { id: string }>({
    mutationFn: async (patch) => {
      const request = requests.find((r) => r.id === patch.id) ?? null;
      if (request === null) {
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
