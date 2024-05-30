import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import type { Settings } from '../lib/models';

export function settingsQueryKey() {
  return ['settings'];
}

export function useSettings() {
  return (
    useQuery({
      queryKey: settingsQueryKey(),
      queryFn: async () => {
        const settings = (await invoke('cmd_get_settings')) as Settings;
        return [settings];
      },
    }).data?.[0] ?? undefined
  );
}
