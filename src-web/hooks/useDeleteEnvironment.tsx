import { useMutation, useQueryClient } from '@tanstack/react-query';
import { InlineCode } from '../components/core/InlineCode';
import { trackEvent } from '../lib/analytics';
import type { Environment, Workspace } from '../lib/models';
import { invokeCmd } from '../lib/tauri';
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
      return invokeCmd('cmd_delete_environment', { environmentId: environment?.id });
    },
    onSettled: () => trackEvent('environment', 'delete'),
    onSuccess: async (environment) => {
      if (environment === null) return;

      const { id: environmentId, workspaceId } = environment;
      queryClient.setQueryData<Workspace[]>(environmentsQueryKey({ workspaceId }), (environments) =>
        environments?.filter((e) => e.id !== environmentId),
      );
    },
  });
}
