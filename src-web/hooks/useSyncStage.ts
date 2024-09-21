import { useQuery } from '@tanstack/react-query';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';

export function useSyncStage() {
  const workspaceId = useActiveWorkspace()?.id ?? null;
  return useQuery({
    queryKey: ['sync_stage', workspaceId],
    queryFn: async () => {
      const result = await invokeCmd('cmd_get_sync_stage', { workspaceId });
      console.log('STAGE', result);
      return result;
    },
  });
}
