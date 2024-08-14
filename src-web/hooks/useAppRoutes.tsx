import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Environment } from '@yaakapp/api';
import { QUERY_COOKIE_JAR_ID } from './useActiveCookieJar';
import { QUERY_ENVIRONMENT_ID } from './useActiveEnvironmentId';
import { useActiveRequestId } from './useActiveRequestId';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

export type RouteParamsWorkspace = {
  workspaceId: string;
  environmentId?: string;
  cookieJarId?: string;
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
    { workspaceId, environmentId, cookieJarId } = {
      workspaceId: ':workspaceId',
      environmentId: ':environmentId',
      cookieJarId: ':cookieJarId',
    } as RouteParamsWorkspace,
  ) {
    const path = `/workspaces/${workspaceId}`;
    const params = new URLSearchParams();
    if (environmentId != null) params.set(QUERY_ENVIRONMENT_ID, environmentId);
    if (cookieJarId != null) params.set(QUERY_COOKIE_JAR_ID, cookieJarId);
    return `${path}?${params}`;
  },
  request(
    { workspaceId, environmentId, requestId, cookieJarId } = {
      workspaceId: ':workspaceId',
      environmentId: ':environmentId',
      requestId: ':requestId',
    } as RouteParamsRequest,
  ) {
    const path = `/workspaces/${workspaceId}/requests/${requestId}`;
    const params = new URLSearchParams();
    if (environmentId != null) params.set(QUERY_ENVIRONMENT_ID, environmentId);
    if (cookieJarId != null) params.set(QUERY_COOKIE_JAR_ID, cookieJarId);
    return `${path}?${params}`;
  },
};

export function useAppRoutes() {
  const activeWorkspaceId = useActiveWorkspaceId();
  const requestId = useActiveRequestId();
  const nav = useNavigate();

  const navigate = useCallback(
    <T extends keyof typeof routePaths>(path: T, ...params: Parameters<(typeof routePaths)[T]>) => {
      // Not sure how to make TS work here, but it's good from the
      // outside caller perspective.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resolvedPath = routePaths[path](...(params as any));
      nav(resolvedPath);
    },
    [nav],
  );

  const setEnvironment = useCallback(
    (environment: Environment | null) => {
      if (activeWorkspaceId == null) {
        navigate('workspaces');
      } else if (requestId == null) {
        navigate('workspace', {
          workspaceId: activeWorkspaceId,
          environmentId: environment == null ? undefined : environment.id,
        });
      } else {
        navigate('request', {
          workspaceId: activeWorkspaceId,
          environmentId: environment == null ? undefined : environment.id,
          requestId,
        });
      }
    },
    [navigate, activeWorkspaceId, requestId],
  );

  return {
    paths: routePaths,
    navigate,
    setEnvironment,
  };
}
