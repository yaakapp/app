import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useRoutes } from './useRoutes';

export function useDuplicateRequest({
  id,
  navigateAfter,
}: {
  id: string | null;
  navigateAfter: boolean;
}) {
  const workspaceId = useActiveWorkspaceId();
  const routes = useRoutes();
  return useMutation<string, string>({
    mutationFn: async () => {
      if (id === null) throw new Error("Can't duplicate a null request");
      return invoke('duplicate_request', { id });
    },
    onSuccess: async (newId: string) => {
      if (navigateAfter && workspaceId !== null) {
        routes.navigate('request', { workspaceId, requestId: newId });
      }
    },
  });
}
