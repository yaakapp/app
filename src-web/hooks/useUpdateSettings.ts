import { useMutation } from '@tanstack/react-query';
import type { Settings } from '../lib/models';
import { invokeCmd } from '../lib/tauri';
import { useSettings } from './useSettings';

export function useUpdateSettings() {
  const settings = useSettings();

  return useMutation<void, unknown, Partial<Settings>>({
    mutationKey: ['update_settings'],
    mutationFn: async (patch) => {
      if (settings == null) return;
      const newSettings: Settings = { ...settings, ...patch };
      await invokeCmd('cmd_update_settings', { settings: newSettings });
    },
  });
}
