import { useQuery } from '@tanstack/react-query';
import { readText } from '@tauri-apps/plugin-clipboard-manager';

export function useClipboardText() {
  return useQuery({
    queryKey: [],
    queryFn: () => readText(),
  }).data;
}
