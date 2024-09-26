import { useQuery } from '@tanstack/react-query';
import type { SyncDiff } from 'tauri-plugin-sync-api';
import { diff } from 'tauri-plugin-sync-api';

export function useSyncDiff(workspaceId: string) {
  return useQuery<SyncDiff[]>({
    queryKey: ['sync_diff', workspaceId],
    queryFn: async () => {
      if (workspaceId == null) return [];
      const foo = await diff(workspaceId);
      return foo;
    },
  });
}
