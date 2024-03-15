import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppRoutes } from '../hooks/useAppRoutes';
import { getRecentEnvironments } from '../hooks/useRecentEnvironments';
import { getRecentRequests } from '../hooks/useRecentRequests';
import { useRecentWorkspaces } from '../hooks/useRecentWorkspaces';
import { useWorkspaces } from '../hooks/useWorkspaces';

export function RedirectToLatestWorkspace() {
  const navigate = useNavigate();
  const routes = useAppRoutes();
  const workspaces = useWorkspaces();
  const recentWorkspaces = useRecentWorkspaces();

  useEffect(() => {
    (async function () {
      const workspaceId = recentWorkspaces[0] ?? workspaces[0]?.id ?? 'n/a';
      const environmentId = (await getRecentEnvironments(workspaceId))[0];
      const requestId = (await getRecentRequests(workspaceId))[0];

      if (workspaceId != null && requestId != null) {
        navigate(routes.paths.request({ workspaceId, environmentId, requestId }));
      } else {
        navigate(routes.paths.workspace({ workspaceId, environmentId }));
      }
    })();
  }, [navigate, routes.paths, workspaces, workspaces.length]);

  return <></>;
}
