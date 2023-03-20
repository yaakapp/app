import { useParams } from 'react-router-dom';
import type { RouteParamsWorkspace } from './useRoutes';

export function useActiveWorkspaceId(): string | null {
  const { workspaceId } = useParams<RouteParamsWorkspace>();
  return workspaceId ?? null;
}
