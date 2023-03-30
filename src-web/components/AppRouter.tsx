import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { routePaths } from '../hooks/useRoutes';
import { useTauriListeners } from '../hooks/useTauriListeners';
import RouteError from './RouteError';
import Workspace from './Workspace';
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
  console.log('AppRouter');
  useTauriListeners();
  console.log('AppRouter 2');
  return <RouterProvider router={router} />;
}
