import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import type { Settings } from '../lib/models';
import { useSettings } from './useSettings';

export function useUpdateSettings() {
  const settings = useSettings();

  return useMutation<void, unknown, Partial<Settings>>({
    mutationFn: async (patch) => {
      if (settings == null) return;
      const newSettings: Settings = { ...settings, ...patch };
      await invoke('cmd_update_settings', { settings: newSettings });
    },
  });
}
