import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { routePaths } from '../hooks/useRoutes';

const Workspaces = lazy(() => import('./Workspaces'));
const Workspace = lazy(() => import('./Workspace'));
const RouteError = lazy(() => import('./RouteError'));

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
