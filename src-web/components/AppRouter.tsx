import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const Workspaces = lazy(() => import('../pages/Workspaces'));
const Workspace = lazy(() => import('../pages/Workspace'));
const RouteError = lazy(() => import('./RouteError'));

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
        path: '/workspaces/:workspaceId',
        element: <Workspace />,
      },
      {
        path: '/workspaces/:workspaceId/requests/:requestId',
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
