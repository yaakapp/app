import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { routePaths, useAppRoutes } from '../hooks/useAppRoutes';
import { useRecentRequests } from '../hooks/useRecentRequests';
import { useRequests } from '../hooks/useRequests';
import { GlobalHooks } from './GlobalHooks';
import RouteError from './RouteError';
import Workspace from './Workspace';
import Workspaces from './Workspaces';
import { DialogProvider } from './DialogContext';

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
        path: routePaths.workspace({ workspaceId: ':workspaceId' }),
        element: <WorkspaceOrRedirect />,
      },
      {
        path: routePaths.request({
          workspaceId: ':workspaceId',
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
  const recentRequests = useRecentRequests();
  const requests = useRequests();
  const request = requests.find((r) => r.id === recentRequests[0]);
  const routes = useAppRoutes();

  if (request === undefined) {
    return <Workspace />;
  }

  return (
    <Navigate
      to={routes.paths.request({ workspaceId: request.workspaceId, requestId: request.id })}
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
