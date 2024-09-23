import { useQuery } from '@tanstack/react-query';
import type { Stage } from '@yaakapp-internal/sync';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';

export function useSyncStage() {
  const workspaceId = useActiveWorkspace()?.id ?? null;
  return useQuery<Stage>({
    queryKey: ['sync_stage', workspaceId],
    queryFn: async () => {
      const result: Stage = await invokeCmd('cmd_get_sync_stage', { workspaceId });
      return result;
    },
  });
}
