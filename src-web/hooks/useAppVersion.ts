import { useQuery } from '@tanstack/react-query';
import { getVersion } from '@tauri-apps/api/app';

export function useAppVersion() {
  return useQuery<string>(['appVersion'], getVersion);
}
