import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { Settings } from '../lib/models';
import { settingsQueryKey } from './useSettings';

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, Settings>({
    mutationFn: async (settings) => {
      await invoke('cmd_update_settings', { settings });
    },
    onMutate: async (settings) => {
      queryClient.setQueryData<Settings[]>(settingsQueryKey(), [settings]);
    },
  });
}
