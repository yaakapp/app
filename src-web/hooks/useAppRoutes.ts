import { useNavigate } from 'react-router-dom';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useActiveRequestId } from './useActiveRequestId';
import type { Environment } from '../lib/models';
import { useCallback } from 'react';

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
  workspace(
    { workspaceId, environmentId } = {
      workspaceId: ':workspaceId',
      environmentId: ':environmentId',
    } as RouteParamsWorkspace,
  ) {
    return `/workspaces/${workspaceId}/environments/${environmentId ?? '__default__'}`;
  },
  request(
    { workspaceId, environmentId, requestId } = {
      workspaceId: ':workspaceId',
      environmentId: ':environmentId',
      requestId: ':requestId',
    } as RouteParamsRequest,
  ) {
    return `${this.workspace({ workspaceId, environmentId })}/requests/${requestId}`;
  },
};

export function useAppRoutes() {
  const workspaceId = useActiveWorkspaceId();
  const requestId = useActiveRequestId();
  const nav = useNavigate();

  const navigate = useCallback(<T extends keyof typeof routePaths>(
    path: T,
    ...params: Parameters<(typeof routePaths)[T]>
  ) => {
    // Not sure how to make TS work here, but it's good from the
    // outside caller perspective.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resolvedPath = routePaths[path](...(params as any));
    nav(resolvedPath);
  }, [nav]);

  const setEnvironment = useCallback(
    (environment: Environment | null) => {
      if (workspaceId == null) {
        navigate('workspaces');
      } else if (requestId == null) {
        navigate('workspace', {
          workspaceId: workspaceId,
          environmentId: environment == null ? undefined : environment.id,
        });
      } else {
        navigate('request', {
          workspaceId,
          environmentId: environment == null ? undefined : environment.id,
          requestId,
        });
      }
    },
    [navigate, workspaceId, requestId],
  );

  return {
    paths: routePaths,
    navigate,
    setEnvironment,
  };
}
