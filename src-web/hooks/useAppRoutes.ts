import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useActiveRequestId } from './useActiveRequestId';
import type { Environment } from '../lib/models';

export type RouteParamsWorkspace = {
  workspaceId: string;
  environmentId: string | null;
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

  const navigate = useNavigate();
  return useMemo(
    () => ({
      setEnvironment({ id: environmentId }: Environment) {
        if (workspaceId == null) {
          this.navigate('workspaces');
        } else if (requestId == null) {
          this.navigate('workspace', {
            workspaceId: workspaceId,
            environmentId: environmentId ?? null,
          });
        } else {
          this.navigate('request', {
            workspaceId,
            environmentId: environmentId ?? null,
            requestId: requestId,
          });
        }
      },
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
    [navigate, requestId, workspaceId],
  );
}
