import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUERY_COOKIE_JAR_ID, useActiveCookieJarId } from './useActiveCookieJarId';
import { QUERY_ENVIRONMENT_ID, useActiveEnvironmentId } from './useActiveEnvironmentId';

export type RouteParamsWorkspace = {
  workspaceId: string;
  environmentId?: string;
};

export type RouteParamsRequest = RouteParamsWorkspace & {
  requestId: string;
};

export const routePaths = {
  workspaces() {
    return '/workspaces';
  },
  workspaceSettings({ workspaceId } = { workspaceId: ':workspaceId' } as RouteParamsWorkspace) {
    return `/workspaces/${workspaceId}/settings`;
  },
  workspace(
    { workspaceId } = {
      workspaceId: ':workspaceId',
    } as RouteParamsWorkspace,
  ) {
    return `/workspaces/${workspaceId}`;
  },
  request(
    { workspaceId, requestId } = {
      workspaceId: ':workspaceId',
      requestId: ':requestId',
    } as RouteParamsRequest,
  ) {
    return `/workspaces/${workspaceId}/requests/${requestId}`;
  },
};

export function useAppRoutes() {
  const nav = useNavigate();
  const [cookieJarId] = useActiveCookieJarId();
  const [environmentId] = useActiveEnvironmentId();

  const navigate = useCallback(
    <T extends keyof typeof routePaths>(path: T, ...params: Parameters<(typeof routePaths)[T]>) => {
      // Not sure how to make TS work here, but it's good from the outside caller perspective.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let resolvedPath = routePaths[path](...(params as any));

      // Carry over relevant query params if necessary
      if (path === 'request' || path === 'workspace') {
        const newParams = new URLSearchParams();
        if (environmentId != null) newParams.set(QUERY_ENVIRONMENT_ID, environmentId);
        if (cookieJarId != null) newParams.set(QUERY_COOKIE_JAR_ID, cookieJarId);
        resolvedPath += `?${newParams}`;
      }

      nav(resolvedPath);
    },
    [cookieJarId, environmentId, nav],
  );

  return { paths: routePaths, navigate } as const;
}
