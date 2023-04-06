import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { routePaths } from '../hooks/useRoutes';
import RouteError from './RouteError';
import { TauriListeners } from './TauriListeners';
import Workspace from './Workspace';
import Workspaces from './Workspaces';

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteError />,
    element: (
      <>
        <Outlet />
        <TauriListeners />
      </>
    ),
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
        element: <Workspace />,
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
