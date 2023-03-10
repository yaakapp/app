import { Router } from 'preact-router';
import { Workspaces } from '../pages/Workspaces';
import { Workspace } from '../Workspace';

export function AppRouter() {
  return (
    <Router>
      <Workspaces path="/" />
      <Workspace path="/workspaces/:workspaceId" />
      <Workspace path="/workspaces/:workspaceId/requests/:requestId" />
    </Router>
  );
}
