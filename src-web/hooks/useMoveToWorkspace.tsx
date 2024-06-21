import { useMutation } from '@tanstack/react-query';
import React from 'react';
import { useDialog } from '../components/DialogContext';
import { MoveToWorkspaceDialog } from '../components/MoveToWorkspaceDialog';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useRequests } from './useRequests';

export function useMoveToWorkspace(id: string) {
  const dialog = useDialog();
  const requests = useRequests();
  const request = requests.find((r) => r.id === id);
  const activeWorkspaceId = useActiveWorkspaceId();

  return useMutation<void, unknown>({
    mutationKey: ['move_workspace', id],
    mutationFn: async () => {
      if (request == null || activeWorkspaceId == null) return;

      dialog.show({
        id: 'change-workspace',
        title: 'Change Workspace',
        size: 'sm',
        render: ({ hide }) => (
          <MoveToWorkspaceDialog
            onDone={hide}
            request={request}
            activeWorkspaceId={activeWorkspaceId}
          />
        ),
      });
    },
  });
}
