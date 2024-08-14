import { useMutation } from '@tanstack/react-query';
import { invokeCmd } from '../lib/tauri';
import { useActiveEnvironment } from './useActiveEnvironment';
import { useCopy } from './useCopy';

export function useCopyAsCurl(requestId: string) {
  const copy = useCopy();
  const [environment] = useActiveEnvironment();
  return useMutation({
    mutationKey: ['copy_as_curl', requestId],
    mutationFn: async () => {
      const cmd: string = await invokeCmd('cmd_request_to_curl', {
        requestId,
        environmentId: environment?.id,
      });
      copy(cmd);
      return cmd;
    },
  });
}
