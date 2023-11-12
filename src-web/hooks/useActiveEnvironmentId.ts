import { useParams } from 'react-router-dom';
import type { RouteParamsRequest } from './useAppRoutes';

export function useActiveEnvironmentId(): string | null {
  const { environmentId } = useParams<RouteParamsRequest>();
  if (environmentId == null || environmentId === '__default__') {
    return null;
  }

  return environmentId;
}
