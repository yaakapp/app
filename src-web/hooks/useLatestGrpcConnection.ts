import type { GrpcConnection } from '@yaakapp-internal/models';
import { useGrpcConnections } from './useGrpcConnections';

export function useLatestGrpcConnection(requestId: string | null): GrpcConnection | null {
  const connections = useGrpcConnections(requestId);
  return connections[0] ?? null;
}
