import { Navigate } from 'react-router-dom';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { Heading } from './core/Heading';
import { useRecentWorkspaces } from '../hooks/useRecentWorkspaces';

export default function Workspaces() {
  const routes = useAppRoutes();
  const recentWorkspaceIds = useRecentWorkspaces();
  const workspaces = useWorkspaces();

  const loading = workspaces.length === 0 && recentWorkspaceIds.length === 0;
  if (loading) {
    return null;
  }

  const workspaceId = recentWorkspaceIds[0] ?? workspaces[0]?.id ?? null;

  if (workspaceId === null) {
    return <Heading>There are no workspaces</Heading>;
  }

  return <Navigate to={routes.paths.workspace({ workspaceId })} />;
}
