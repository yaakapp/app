import { useQuery } from '@tanstack/react-query';
import type { SyncDiff } from '@yaakapp-internal/sync';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';

export function useSyncDiff() {
  const workspaceId = useActiveWorkspace()?.id ?? null;
  return useQuery<SyncDiff[]>({
    queryKey: ['sync_diff', workspaceId],
    queryFn: () => invokeCmd('cmd_get_sync_stage', { workspaceId }),
  });
}
