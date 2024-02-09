import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { InlineCode } from '../components/core/InlineCode';
import { trackEvent } from '../lib/analytics';
import type { Environment, Workspace } from '../lib/models';
import { useConfirm } from './useConfirm';
import { environmentsQueryKey } from './useEnvironments';

export function useDeleteEnvironment(environment: Environment | null) {
  const queryClient = useQueryClient();
  const confirm = useConfirm();

  return useMutation<Environment | null, string>({
    mutationFn: async () => {
      const confirmed = await confirm({
        id: 'delete-environment',
        title: 'Delete Environment',
        variant: 'delete',
        description: (
          <>
            Permanently delete <InlineCode>{environment?.name}</InlineCode>?
          </>
        ),
      });
      if (!confirmed) return null;
      return invoke('cmd_delete_environment', { environmentId: environment?.id });
    },
    onSettled: () => trackEvent('Environment', 'Delete'),
    onSuccess: async (environment) => {
      if (environment === null) return;

      const { id: environmentId, workspaceId } = environment;
      queryClient.setQueryData<Workspace[]>(environmentsQueryKey({ workspaceId }), (environments) =>
        environments?.filter((e) => e.id !== environmentId),
      );
    },
  });
}
