import { useMutation } from '@tanstack/react-query';
import type { GrpcRequest } from '../lib/models';
import { useUpdateAnyGrpcRequest } from './useUpdateAnyGrpcRequest';

export function useUpdateGrpcRequest(id: string | null) {
  const updateAnyGrpcRequest = useUpdateAnyGrpcRequest();
  return useMutation<void, unknown, Partial<GrpcRequest> | ((r: GrpcRequest) => GrpcRequest)>({
    mutationKey: ['update_grpc_request', id],
    mutationFn: async (update) => {
      return updateAnyGrpcRequest.mutateAsync({ id: id ?? 'n/a', update });
    },
  });
}
