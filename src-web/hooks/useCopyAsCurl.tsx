import { useMutation } from '@tanstack/react-query';
import { invokeCmd } from '../lib/tauri';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useCopy } from './useCopy';

export function useCopyAsCurl(requestId: string) {
  const copy = useCopy();
  const environmentId = useActiveEnvironmentId();
  return useMutation({
    mutationKey: ['copy_as_curl', requestId],
    mutationFn: async () => {
      const cmd: string = await invokeCmd('cmd_request_to_curl', { requestId, environmentId });
      copy(cmd);
      return cmd;
    },
  });
}
