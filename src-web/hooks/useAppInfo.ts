import { useQuery } from '@tanstack/react-query';
import { invokeCmd } from '../lib/tauri';

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
      const metadata = await invokeCmd('cmd_metadata');
      return metadata as AppInfo;
    },
  }).data;
}
