import { useMutation } from '@tanstack/react-query';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';

export function useInstallPlugin() {
  return useMutation<void, unknown, string>({
    mutationKey: ['install_plugin'],
    mutationFn: async (directory: string) => {
      await invokeCmd('cmd_install_plugin', { directory });
    },
    onSettled: () => trackEvent('plugin', 'create'),
  });
}
