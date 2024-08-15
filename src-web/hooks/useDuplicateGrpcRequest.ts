import { useMutation } from '@tanstack/react-query';
import type { GrpcRequest } from '@yaakapp/api';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';
import { useActiveEnvironment } from './useActiveEnvironment';
import { useActiveWorkspace } from './useActiveWorkspace';
import { useAppRoutes } from './useAppRoutes';
import { getGrpcProtoFiles, setGrpcProtoFiles } from './useGrpcProtoFiles';

export function useDuplicateGrpcRequest({
  id,
  navigateAfter,
}: {
  id: string | null;
  navigateAfter: boolean;
}) {
  const activeWorkspace = useActiveWorkspace();
  const [activeEnvironment] = useActiveEnvironment();
  const routes = useAppRoutes();

  return useMutation<GrpcRequest, string>({
    mutationKey: ['duplicate_grpc_request', id],
    mutationFn: async () => {
      if (id === null) throw new Error("Can't duplicate a null grpc request");
      return invokeCmd('cmd_duplicate_grpc_request', { id });
    },
    onSettled: () => trackEvent('grpc_request', 'duplicate'),
    onSuccess: async (request) => {
      if (id == null) return;

      // Also copy proto files to new request
      const protoFiles = await getGrpcProtoFiles(id);
      await setGrpcProtoFiles(request.id, protoFiles);

      if (navigateAfter && activeWorkspace !== null) {
        routes.navigate('request', {
          workspaceId: activeWorkspace.id,
          requestId: request.id,
          environmentId: activeEnvironment?.id,
        });
      }
    },
  });
}
