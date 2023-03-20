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

export function useRoutes() {
  return {
    navigate<T extends keyof typeof routePaths>(
      path: T,
      params: Parameters<(typeof routePaths)[T]>[0],
    ) {
      // Not sure how to make TS work here, but it's good from the
      // outside caller perspective.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      routePaths[path](params as any);
    },
    paths: routePaths,
  };
}
