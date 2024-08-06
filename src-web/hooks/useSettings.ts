import { useQuery } from '@tanstack/react-query';
import type { Settings } from '../lib/models/Settings';
import { invokeCmd } from '../lib/tauri';

export function settingsQueryKey() {
  return ['settings'];
}

export function useSettings() {
  return (
    useQuery({
      queryKey: settingsQueryKey(),
      queryFn: async () => {
        const settings = (await invokeCmd('cmd_get_settings')) as Settings;
        return [settings];
      },
    }).data?.[0] ?? undefined
  );
}
