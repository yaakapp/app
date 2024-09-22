import type { GrpcRequest, HttpRequest } from '@yaakapp-internal/models';
import { useActiveRequestId } from './useActiveRequestId';
import { useRequests } from './useRequests';

interface TypeMap {
  http_request: HttpRequest;
  grpc_request: GrpcRequest;
}

export function useActiveRequest<T extends keyof TypeMap>(
  model?: T | undefined,
): TypeMap[T] | null {
  const requestId = useActiveRequestId();
  const requests = useRequests();

  for (const request of requests) {
    const modelMatch = model == null ? true : request.model === model;
    if (modelMatch && request.id === requestId) {
      return request as TypeMap[T];
    }
  }

  return null;
}
