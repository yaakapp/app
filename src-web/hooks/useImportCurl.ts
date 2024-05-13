import { invoke } from '@tauri-apps/api/core';
import { useMutation } from '@tanstack/react-query';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useRequestUpdateKey } from './useRequestUpdateKey';
import { useUpdateAnyHttpRequest } from './useUpdateAnyHttpRequest';
import { useToast } from '../components/ToastContext';
import { useCreateHttpRequest } from './useCreateHttpRequest';

export function useImportCurl() {
  const workspaceId = useActiveWorkspaceId();
  const updateRequest = useUpdateAnyHttpRequest();
  const createRequest = useCreateHttpRequest();
  const { wasUpdatedExternally } = useRequestUpdateKey(null);
  const toast = useToast();

  return useMutation({
    mutationFn: async ({ requestId, command }: { requestId: string | null; command: string }) => {
      const request: Record<string, unknown> = await invoke('cmd_curl_to_request', {
        command,
        workspaceId,
      });
      delete request.id;

      const id = requestId ?? (await createRequest.mutateAsync({})).id;
      await updateRequest.mutateAsync({ id, update: request });

      const verb = requestId ? 'updated' : 'created';
      toast.show({
        variant: 'success',
        message: `Request ${verb} from Curl`,
      });

      wasUpdatedExternally(id);
    },
  });
}
