import { r } from 'vitest/dist/types-94cfe4b4';
import type { GrpcRequest, HttpRequest } from '../lib/models';
import { useActiveRequestId } from './useActiveRequestId';
import { useGrpcRequests } from './useGrpcRequests';
import { useHttpRequests } from './useHttpRequests';

interface TypeMap {
  http_request: HttpRequest;
  grpc_request: GrpcRequest;
}

export function useActiveRequest<T extends keyof TypeMap>(
  model?: T | undefined,
): TypeMap[T] | null {
  const requestId = useActiveRequestId();
  const httpRequests = useHttpRequests();
  const grpcRequests = useGrpcRequests();

  if (model === 'http_request') {
    return (httpRequests.find((r) => r.id === requestId) ?? null) as TypeMap[T] | null;
  } else if (model === 'grpc_request') {
    return (grpcRequests.find((r) => r.id === requestId) ?? null) as TypeMap[T] | null;
  } else {
    return (grpcRequests.find((r) => r.id === requestId) ??
      httpRequests.find((r) => r.id === requestId) ??
      null) as TypeMap[T] | null;
  }
}
