import { invoke } from '@tauri-apps/api/core';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { useState } from 'react';

export function useCopyAsCurl(requestId: string) {
  const [checked, setChecked] = useState<boolean>(false);
  return [
    checked,
    async () => {
      const cmd: string = await invoke('cmd_request_to_curl', { requestId });
      await writeText(cmd);
      setChecked(true);
      setTimeout(() => setChecked(false), 800);
      return cmd;
    },
  ] as const;
}
