import { useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { SyncDiff } from './bindings/sync';

export * from './bindings/models';
export * from './bindings/sync';

export function useDiff(workspaceId: string) {
  return useQuery<SyncDiff[]>({
    queryKey: ['sync_diff', workspaceId],
    queryFn: () => invoke('plugin:sync|diff', { workspaceId }),
  });
}
