import { Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { routePaths } from '../hooks/useRoutes';
import Workspace from './Workspace';
import RouteError from './RouteError';
import Workspaces from './Workspaces';

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteError />,
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
  return (
    <Suspense>
      <RouterProvider router={router} />
    </Suspense>
  );
}
