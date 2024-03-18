import { useMemo } from 'react';
import { useGrpcRequests } from './useGrpcRequests';
import { useHttpRequests } from './useHttpRequests';

export function useRequests() {
  const httpRequests = useHttpRequests();
  const grpcRequests = useGrpcRequests();
  return useMemo(() => [...httpRequests, ...grpcRequests], [httpRequests, grpcRequests]);
}
