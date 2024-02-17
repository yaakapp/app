import { useQuery } from '@tanstack/react-query';
import * as app from '@tauri-apps/api/app';
import * as path from '@tauri-apps/api/path';

export function useAppInfo() {
  return useQuery(['appInfo'], async () => {
    const [version, appDataDir] = await Promise.all([app.getVersion(), path.appDataDir()]);
    return { version, appDataDir };
  });
}
