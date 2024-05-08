import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';

export function useCopyAsCurl(requestId: string) {
  return useMutation<string>({
    mutationFn: async () => {
      const cmd: string = await invoke('cmd_request_to_curl', { requestId });
      await writeText(cmd);
      return cmd;
    },
  });
}
