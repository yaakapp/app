import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

export interface AppInfo {
  isDev: boolean;
  version: string;
  name: string;
  appDataDir: string;
  appLogDir: string;
}

export function useAppInfo() {
  return useQuery({
    queryKey: ['appInfo'],
    queryFn: async () => {
      const metadata = await invoke('cmd_metadata');
      return metadata as AppInfo;
    },
  }).data;
}
