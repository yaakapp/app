import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { minPromiseMillis } from '../lib/minPromiseMillis';
import { useAlert } from './useAlert';

export function useCheckForUpdates() {
  const alert = useAlert();
  return useMutation({
    mutationFn: async () => {
      const hasUpdate: boolean = await minPromiseMillis(invoke('cmd_check_for_updates'), 500);
      if (!hasUpdate) {
        alert({
          id: 'no-updates',
          title: 'No Updates',
          body: 'You are currently up to date',
        });
      }
    },
  });
}
