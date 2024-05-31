import { invoke } from '@tauri-apps/api/core';
import { useClipboardText } from './useClipboardText';

export function useCopyAsCurl(requestId: string) {
  const [, copy] = useClipboardText();
  return async () => {
    const cmd: string = await invoke('cmd_request_to_curl', { requestId });
    copy(cmd);
    return cmd;
  };
}
