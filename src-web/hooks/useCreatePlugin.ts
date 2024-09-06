import { useMutation } from '@tanstack/react-query';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';

export function useCreatePlugin() {
  return useMutation<void, unknown, string>({
    mutationKey: ['create_plugin'],
    mutationFn: async (directory: string) => {
      await invokeCmd('cmd_create_plugin', { directory });
    },
    onSettled: () => trackEvent('plugin', 'create'),
  });
}
