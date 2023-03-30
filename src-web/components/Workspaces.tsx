import { Navigate } from 'react-router-dom';
import { useRoutes } from '../hooks/useRoutes';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { Heading } from './core/Heading';

export default function Workspaces() {
  const routes = useRoutes();
  const workspaces = useWorkspaces();
  const workspace = workspaces[0];

  if (workspace === undefined) {
    return <Heading>There are no workspaces</Heading>;
  }

  return <Navigate to={routes.paths.workspace({ workspaceId: workspace.id })} />;
}
