import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { routePaths, useAppRoutes } from '../hooks/useAppRoutes';
import { useRecentRequests } from '../hooks/useRecentRequests';
import { useRequests } from '../hooks/useRequests';
import { GlobalHooks } from './GlobalHooks';
import RouteError from './RouteError';
import Workspace from './Workspace';
import Workspaces from './Workspaces';
import { DialogProvider } from './DialogContext';
import { useActiveEnvironmentId } from '../hooks/useActiveEnvironmentId';

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteError />,
    element: <Layout />,
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
          environmentId: ':environmentId',
        }),
        element: <WorkspaceOrRedirect />,
      },
      {
        path: routePaths.request({
          workspaceId: ':workspaceId',
          environmentId: ':environmentId',
          requestId: ':requestId',
        }),
        element: <Workspace />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

function WorkspaceOrRedirect() {
  const environmentId = useActiveEnvironmentId();
  const recentRequests = useRecentRequests();
  const requests = useRequests();
  const request = requests.find((r) => r.id === recentRequests[0]);
  const routes = useAppRoutes();

  if (request === undefined) {
    return <Workspace />;
  }

  return (
    <Navigate
      to={routes.paths.request({
        workspaceId: request.workspaceId,
        environmentId: environmentId ?? undefined,
        requestId: request.id,
      })}
    />
  );
}

function Layout() {
  return (
    <DialogProvider>
      <Outlet />
      <GlobalHooks />
    </DialogProvider>
  );
}
