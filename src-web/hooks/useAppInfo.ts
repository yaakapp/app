import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

export function useAppInfo() {
  return useQuery(['appInfo'], async () => {
    return (await invoke('cmd_metadata')) as {
      isDev: boolean;
      version: string;
      name: string;
      appDataDir: string;
    };
  });
}
