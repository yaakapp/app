import { useMutation } from '@tanstack/react-query';
import { trackEvent } from '../lib/analytics';
import { setKeyValue } from '../lib/keyValueStore';
import type { GrpcRequest } from '@yaakapp/api';
import { invokeCmd } from '../lib/tauri';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useAppRoutes } from './useAppRoutes';
import { protoFilesArgs, useGrpcProtoFiles } from './useGrpcProtoFiles';

export function useDuplicateGrpcRequest({
  id,
  navigateAfter,
}: {
  id: string | null;
  navigateAfter: boolean;
}) {
  const activeWorkspaceId = useActiveWorkspaceId();
  const [activeEnvironmentId] = useActiveEnvironmentId();
  const routes = useAppRoutes();
  const protoFiles = useGrpcProtoFiles(id);
  return useMutation<GrpcRequest, string>({
    mutationKey: ['duplicate_grpc_request', id],
    mutationFn: async () => {
      if (id === null) throw new Error("Can't duplicate a null grpc request");
      return invokeCmd('cmd_duplicate_grpc_request', { id });
    },
    onSettled: () => trackEvent('grpc_request', 'duplicate'),
    onSuccess: async (request) => {
      // Also copy proto files to new request
      await setKeyValue({ ...protoFilesArgs(request.id), value: protoFiles.value ?? [] });

      if (navigateAfter && activeWorkspaceId !== null) {
        routes.navigate('request', {
          workspaceId: activeWorkspaceId,
          requestId: request.id,
          environmentId: activeEnvironmentId ?? undefined,
        });
      }
    },
  });
}
