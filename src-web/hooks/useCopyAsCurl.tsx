import { invoke } from '@tauri-apps/api/core';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import React, { useState } from 'react';
import { useToast } from '../components/ToastContext';
import { Icon } from '../components/core/Icon';

export function useCopyAsCurl(requestId: string) {
  const [checked, setChecked] = useState<boolean>(false);
  const toast = useToast();
  return [
    checked,
    async () => {
      const cmd: string = await invoke('cmd_request_to_curl', { requestId });
      await writeText(cmd);
      setChecked(true);
      setTimeout(() => setChecked(false), 800);
      toast.show({
        render: () => [
          <>
            <Icon icon="copyCheck" />
            <span>Command copied to clipboard</span>
          </>,
        ],
      });
      return cmd;
    },
  ] as const;
}
