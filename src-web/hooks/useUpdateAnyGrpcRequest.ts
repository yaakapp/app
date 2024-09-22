import { useMutation } from '@tanstack/react-query';
import type { GrpcRequest } from '@yaakapp-internal/models';
import { getGrpcRequest } from '../lib/store';
import { invokeCmd } from '../lib/tauri';

export function useUpdateAnyGrpcRequest() {
  return useMutation<
    void,
    unknown,
    { id: string; update: Partial<GrpcRequest> | ((r: GrpcRequest) => GrpcRequest) }
  >({
    mutationKey: ['update_any_grpc_request'],
    mutationFn: async ({ id, update }) => {
      const request = await getGrpcRequest(id);
      if (request === null) {
        throw new Error("Can't update a null request");
      }

      const patchedRequest =
        typeof update === 'function' ? update(request) : { ...request, ...update };
      await invokeCmd('cmd_update_grpc_request', { request: patchedRequest });
    },
  });
}
