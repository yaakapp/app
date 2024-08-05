import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Environment } from '@yaakapp/api';
import { QUERY_ENVIRONMENT_ID } from './useActiveEnvironmentId';
import { useActiveRequestId } from './useActiveRequestId';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';

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
    { workspaceId, environmentId } = {
      workspaceId: ':workspaceId',
      environmentId: ':environmentId',
    } as RouteParamsWorkspace,
  ) {
    let path = `/workspaces/${workspaceId}`;
    if (environmentId != null) {
      path += `?${QUERY_ENVIRONMENT_ID}=${encodeURIComponent(environmentId)}`;
    }
    return path;
  },
  request(
    { workspaceId, environmentId, requestId } = {
      workspaceId: ':workspaceId',
      environmentId: ':environmentId',
      requestId: ':requestId',
    } as RouteParamsRequest,
  ) {
    let path = `/workspaces/${workspaceId}/requests/${requestId}`;
    if (environmentId != null) {
      path += `?${QUERY_ENVIRONMENT_ID}=${encodeURIComponent(environmentId)}`;
    }
    return path;
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
