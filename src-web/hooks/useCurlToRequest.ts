import { invoke } from '@tauri-apps/api/core';
import { useMutation } from '@tanstack/react-query';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useRequestUpdateKey } from './useRequestUpdateKey';
import { useUpdateAnyHttpRequest } from './useUpdateAnyHttpRequest';

export function useCurlToRequest() {
  const workspaceId = useActiveWorkspaceId();
  const updateRequest = useUpdateAnyHttpRequest();
  const { wasUpdatedExternally } = useRequestUpdateKey(null);

  return useMutation({
    mutationFn: async ({ requestId, command }: { requestId: string; command: string }) => {
      const request: Record<string, unknown> = await invoke('cmd_curl_to_request', {
        command,
        workspaceId,
      });
      delete request.id;
      await updateRequest.mutateAsync({ id: requestId, update: request });
      wasUpdatedExternally(requestId);
      console.log('FOO', request);
    },
  });
}
