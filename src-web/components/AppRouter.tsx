import { createBrowserRouter, Navigate, Outlet, RouterProvider, useParams } from 'react-router-dom';
import { useActiveEnvironmentId } from '../hooks/useActiveEnvironmentId';
import { routePaths, useAppRoutes } from '../hooks/useAppRoutes';
import { useHttpRequests } from '../hooks/useHttpRequests';
import { useRecentRequests } from '../hooks/useRecentRequests';
import { DialogProvider } from './DialogContext';
import { GlobalHooks } from './GlobalHooks';
import RouteError from './RouteError';
import Workspace from './Workspace';
import Workspaces from './Workspaces';

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteError />,
    element: <DefaultLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to={routePaths.workspaces()} replace={true} />,
      },
      {
        path: routePaths.workspaces(),
        element: <Workspaces />,
      },
      {
        path: routePaths.workspace({
          workspaceId: ':workspaceId',
        }),
        element: <WorkspaceOrRedirect />,
      },
      {
        path: routePaths.request({
          workspaceId: ':workspaceId',
          requestId: ':requestId',
        }),
        element: <Workspace />,
      },
      {
        path: '/workspaces/:workspaceId/environments/:environmentId/requests/:requestId',
        element: <RedirectLegacyEnvironmentURLs />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

function WorkspaceOrRedirect() {
  const recentRequests = useRecentRequests();
  const requests = useHttpRequests();
  const request = requests.find((r) => r.id === recentRequests[0]);
  const routes = useAppRoutes();

  // Keep environment if it's in the query params
  const environmentId = useActiveEnvironmentId() ?? undefined;

  if (request === undefined) {
    return <Workspace />;
  }

  const { id: requestId, workspaceId } = request;

  return (
    <Navigate
      to={routes.paths.request({
        workspaceId,
        environmentId,
        requestId,
      })}
    />
  );
}

function RedirectLegacyEnvironmentURLs() {
  const routes = useAppRoutes();
  const {
    requestId,
    environmentId: rawEnvironmentId,
    workspaceId,
  } = useParams<{
    requestId?: string;
    workspaceId?: string;
    environmentId?: string;
  }>();
  const environmentId = rawEnvironmentId === '__default__' ? undefined : rawEnvironmentId;

  let to = '/';
  if (workspaceId != null && requestId != null) {
    to = routes.paths.request({ workspaceId, environmentId, requestId });
  } else if (workspaceId != null) {
    to = routes.paths.workspace({ workspaceId, environmentId });
  } else {
    to = routes.paths.workspaces();
  }

  return <Navigate to={to} />;
}

function DefaultLayout() {
  return (
    <DialogProvider>
      <Outlet />
      <GlobalHooks />
    </DialogProvider>
  );
}
