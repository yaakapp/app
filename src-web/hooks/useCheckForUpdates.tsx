import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { InlineCode } from '../components/core/InlineCode';
import { minPromiseMillis } from '../lib/minPromiseMillis';
import { useAlert } from './useAlert';
import { useAppInfo } from './useAppInfo';

export function useCheckForUpdates() {
  const alert = useAlert();
  const appInfo = useAppInfo();
  return useMutation({
    mutationFn: async () => {
      const hasUpdate: boolean = await minPromiseMillis(invoke('cmd_check_for_updates'), 500);
      if (!hasUpdate) {
        alert({
          id: 'no-updates',
          title: 'No Update Available',
          body: (
            <>
              You are currently on the latest version <InlineCode>{appInfo?.version}</InlineCode>
            </>
          ),
        });
      }
    },
  });
}
