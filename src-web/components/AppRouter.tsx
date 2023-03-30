import { useEffect } from 'react';
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
  useLocation,
} from 'react-router-dom';
import { routePaths } from '../hooks/useRoutes';
import { useTauriListeners } from '../hooks/useTauriListeners';
import { setLastLocation } from '../lib/lastLocation';
import RouteError from './RouteError';
import Workspace from './Workspace';
import Workspaces from './Workspaces';

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteError />,
    element: <RouterRoot />,
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
  useTauriListeners();
  return <RouterProvider router={router} />;
}

function RouterRoot() {
  const { pathname } = useLocation();
  useEffect(() => {
    setLastLocation(pathname).catch(console.error);
  }, [pathname]);
  return <Outlet />;
}
