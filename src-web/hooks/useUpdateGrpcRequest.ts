import { useMutation } from '@tanstack/react-query';
import type { GrpcRequest } from '../lib/models';
import { useUpdateAnyGrpcRequest } from './useUpdateAnyGrpcRequest';

export function useUpdateGrpcRequest(id: string | null) {
  const updateAnyRequest = useUpdateAnyGrpcRequest();
  return useMutation<void, unknown, Partial<GrpcRequest> | ((r: GrpcRequest) => GrpcRequest)>({
    mutationFn: async (update) => updateAnyRequest.mutateAsync({ id: id ?? 'n/a', update }),
  });
}
