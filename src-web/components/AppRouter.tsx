import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Workspaces } from '../pages/Workspaces';
import { Workspace } from '../pages/Workspace';
import { RouteError } from "./RouteError";

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
    <RouterProvider router={router} />
  );
}
