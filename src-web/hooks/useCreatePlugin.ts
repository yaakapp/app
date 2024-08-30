import { useMutation } from '@tanstack/react-query';
import type { Plugin } from '@yaakapp/api';
import { trackEvent } from '../lib/analytics';
import { invokeCmd } from '../lib/tauri';

export function useCreatePlugin() {
  return useMutation<void, unknown, Partial<Plugin>>({
    mutationKey: ['create_plugin'],
    mutationFn: async (patch = {}) => {
      await invokeCmd('cmd_create_plugin', {
        name: patch.name,
      });
    },
    onSettled: () => trackEvent('plugin', 'create'),
  });
}
