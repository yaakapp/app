import { useParams } from 'react-router-dom';
import type { RouteParamsRequest } from './useAppRoutes';

export function useActiveRequestId(): string | null {
  const { requestId } = useParams<RouteParamsRequest>();
  return requestId ?? null;
}
