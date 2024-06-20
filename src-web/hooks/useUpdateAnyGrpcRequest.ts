import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { GrpcRequest } from '../lib/models';
import { getGrpcRequest } from '../lib/store';
import { invokeCmd } from '../lib/tauri';
import { grpcRequestsQueryKey } from './useGrpcRequests';

export function useUpdateAnyGrpcRequest() {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    unknown,
    { id: string; update: Partial<GrpcRequest> | ((r: GrpcRequest) => GrpcRequest) }
  >({
    mutationFn: async ({ id, update }) => {
      const request = await getGrpcRequest(id);
      if (request === null) {
        throw new Error("Can't update a null request");
      }

      const patchedRequest =
        typeof update === 'function' ? update(request) : { ...request, ...update };
      await invokeCmd('cmd_update_grpc_request', { request: patchedRequest });
    },
    onMutate: async ({ id, update }) => {
      const request = await getGrpcRequest(id);
      if (request === null) return;
      const patchedRequest =
        typeof update === 'function' ? update(request) : { ...request, ...update };
      queryClient.setQueryData<GrpcRequest[]>(grpcRequestsQueryKey(request), (requests) =>
        (requests ?? []).map((r) => (r.id === patchedRequest.id ? patchedRequest : r)),
      );
    },
  });
}
