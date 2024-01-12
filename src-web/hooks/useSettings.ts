import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { Settings } from '../lib/models';

export function settingsQueryKey() {
  return ['settings'];
}

export function useSettings() {
  return (
    useQuery({
      queryKey: settingsQueryKey(),
      queryFn: async () => {
        return (await invoke('get_settings')) as Settings;
      },
    }).data ?? undefined
  );
}
