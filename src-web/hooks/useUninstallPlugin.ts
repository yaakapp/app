import { useMutation } from '@tanstack/react-query';
import type { Plugin } from '@yaakapp/api';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';

export function useUninstallPlugin(pluginId: string) {
  return useMutation<Plugin | null, string>({
    mutationKey: ['uninstall_plugin'],
    mutationFn: async () => {
      return invokeCmd('cmd_uninstall_plugin', { pluginId });
    },
    onSettled: () => trackEvent('plugin', 'delete'),
  });
}
