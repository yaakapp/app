import { type } from '@tauri-apps/plugin-os';

export function useOsInfo() {
  return { osType: type() };
}
