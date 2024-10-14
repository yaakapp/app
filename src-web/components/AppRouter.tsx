import { lazy } from 'react';
import { createBrowserRouter, Navigate, RouterProvider, useParams } from 'react-router-dom';
import { routePaths, useAppRoutes } from '../hooks/useAppRoutes';
import { useGenerateThemeCss } from '../hooks/useGenerateThemeCss';
import { useSyncFontSizeSetting } from '../hooks/useSyncFontSizeSetting';
import { useSyncModelStores } from '../hooks/useSyncModelStores';
import { useSyncZoomSetting } from '../hooks/useSyncZoomSetting';
import { DefaultLayout } from './DefaultLayout';
import { RedirectToLatestWorkspace } from './RedirectToLatestWorkspace';
import RouteError from './RouteError';

const LazyWorkspace = lazy(() => import('./Workspace'));
const LazySettings = lazy(() => import('./Settings/Settings'));

const router = createBrowserRouter([
  {
    path: '/',
    errorElement: <RouteError />,
    element: <DefaultLayout />,
    children: [
      {
        path: '/',
        element: <RedirectToLatestWorkspace />,
      },
      {
        path: routePaths.workspaces(),
        element: <RedirectToLatestWorkspace />,
      },
      {
        path: routePaths.workspace({
          workspaceId: ':workspaceId',
        }),
        element: <LazyWorkspace />,
      },
      {
        path: routePaths.request({
          workspaceId: ':workspaceId',
          requestId: ':requestId',
        }),
        element: <LazyWorkspace />,
      },
      {
        path: '/workspaces/:workspaceId/environments/:environmentId/requests/:requestId',
        element: <RedirectLegacyEnvironmentURLs />,
      },
      {
        path: routePaths.workspaceSettings({
          workspaceId: ':workspaceId',
        }),
        element: <LazySettings />,
      },
    ],
  },
]);

export function AppRouter() {
  // Add some global hooks that should remain persistent
  useSyncModelStores();
  useSyncZoomSetting();
  useSyncFontSizeSetting();
  useGenerateThemeCss();

  return <RouterProvider router={router} />;
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

  let to;
  if (workspaceId != null && requestId != null) {
    to = routes.paths.request({ workspaceId, environmentId, requestId });
  } else if (workspaceId != null) {
    to = routes.paths.workspace({ workspaceId, environmentId });
  } else {
    to = routes.paths.workspaces();
  }

  return <Navigate to={to} />;
}
