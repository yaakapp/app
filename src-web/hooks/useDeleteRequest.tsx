import { useMutation } from '@tanstack/react-query';
import type { GrpcRequest, HttpRequest } from '../lib/models';
import { useDeleteAnyGrpcRequest } from './useDeleteAnyGrpcRequest';
import { useDeleteAnyHttpRequest } from './useDeleteAnyHttpRequest';

export function useDeleteRequest(request: HttpRequest | GrpcRequest | null) {
  const deleteAnyHttpRequest = useDeleteAnyHttpRequest();
  const deleteAnyGrpcRequest = useDeleteAnyGrpcRequest();

  return useMutation<void, string>({
    mutationFn: async () => {
      if (request?.model === 'http_request') {
        await deleteAnyHttpRequest.mutateAsync(request.id);
      } else if (request?.model === 'grpc_request') {
        await deleteAnyGrpcRequest.mutateAsync(request.id);
      } else {
        // Request is null
      }
    },
  });
}
