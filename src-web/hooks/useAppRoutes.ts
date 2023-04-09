import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export type RouteParamsWorkspace = {
  workspaceId: string;
};

export type RouteParamsRequest = RouteParamsWorkspace & {
  requestId: string;
};

export const routePaths = {
  workspaces() {
    return '/workspaces';
  },
  workspace({ workspaceId } = { workspaceId: ':workspaceId' } as RouteParamsWorkspace) {
    return `/workspaces/${workspaceId}`;
  },
  request(
    { workspaceId, requestId } = {
      workspaceId: ':workspaceId',
      requestId: ':requestId',
    } as RouteParamsRequest,
  ) {
    return `${this.workspace({ workspaceId })}/requests/${requestId}`;
  },
};

export function useAppRoutes() {
  const navigate = useNavigate();
  return useMemo(
    () => ({
      navigate<T extends keyof typeof routePaths>(
        path: T,
        ...params: Parameters<(typeof routePaths)[T]>
      ) {
        // Not sure how to make TS work here, but it's good from the
        // outside caller perspective.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const resolvedPath = routePaths[path](...(params as any));
        navigate(resolvedPath);
      },
      paths: routePaths,
    }),
    [navigate],
  );
}
