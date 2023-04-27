import { useQuery } from '@tanstack/react-query';
import type { OsType } from '@tauri-apps/api/os';
import { type } from '@tauri-apps/api/os';

export function useOsInfo() {
  return useQuery<{ osType: OsType }>({
    queryKey: ['platform'],
    queryFn: async () => {
      return { osType: await type() };
    },
  }).data;
}
