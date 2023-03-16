import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const Workspaces = lazy(() => import('./Workspaces'));
const Workspace = lazy(() => import('./Workspace'));
const RouteError = lazy(() => import('./RouteError'));

export const WORKSPACE_PATH = '/workspaces/:workspaceId';
export const WORKSPACE_REQUEST_PATH = '/workspaces/:workspaceId/requests/:requestId';

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteError />,
    children: [
      {
        path: '/',
        element: <Workspaces />,
      },
      {
        path: WORKSPACE_PATH,
        element: <Workspace />,
      },
      {
        path: WORKSPACE_REQUEST_PATH,
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
