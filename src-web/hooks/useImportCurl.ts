import { useMutation } from '@tanstack/react-query';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useRequestUpdateKey } from './useRequestUpdateKey';
import { useUpdateAnyHttpRequest } from './useUpdateAnyHttpRequest';
import { useToast } from '../components/ToastContext';
import { useCreateHttpRequest } from './useCreateHttpRequest';
import { useClipboardText } from './useClipboardText';

export function useImportCurl({ clearClipboard }: { clearClipboard?: boolean } = {}) {
  const workspaceId = useActiveWorkspaceId();
  const updateRequest = useUpdateAnyHttpRequest();
  const createRequest = useCreateHttpRequest();
  const { wasUpdatedExternally } = useRequestUpdateKey(null);
  const toast = useToast();
  const [, setClipboardText] = useClipboardText();

  return useMutation({
    mutationFn: async ({ requestId, command }: { requestId: string | null; command: string }) => {
      const request: Record<string, unknown> = await invokeCmd('cmd_curl_to_request', {
        command,
        workspaceId,
      });
      delete request.id;

      let verb;
      if (requestId == null) {
        verb = 'Created';
        await createRequest.mutateAsync(request);
      } else {
        verb = 'Updated';
        await updateRequest.mutateAsync({ id: requestId, update: request });
        setTimeout(() => wasUpdatedExternally(requestId), 100);
      }

      toast.show({
        variant: 'success',
        message: `${verb} request from Curl`,
      });

      if (clearClipboard) {
        setClipboardText('');
      }
    },
  });
}
