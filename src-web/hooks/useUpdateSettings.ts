import { useMutation } from '@tanstack/react-query';
import type { Settings } from '../lib/models';
import { getSettings } from '../lib/store';
import { invokeCmd } from '../lib/tauri';

export function useUpdateSettings() {
  return useMutation<void, unknown, Partial<Settings>>({
    mutationKey: ['update_settings'],
    mutationFn: async (patch) => {
      const settings = await getSettings();
      const newSettings: Settings = { ...settings, ...patch };
      await invokeCmd('cmd_update_settings', { settings: newSettings });
    },
  });
}
