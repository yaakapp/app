import { useMutation } from '@tanstack/react-query';
import { useDialog } from '../components/DialogContext';
import { ExportDataDialog } from '../components/ExportDataDialog';
import { useActiveWorkspace } from './useActiveWorkspace';
import { useAlert } from './useAlert';
import { useWorkspaces } from './useWorkspaces';

export function useExportData() {
  const workspaces = useWorkspaces();
  const activeWorkspace = useActiveWorkspace();
  const alert = useAlert();
  const dialog = useDialog();

  return useMutation({
    onError: (err: string) => {
      alert({ id: 'export-failed', title: 'Export Failed', body: err });
    },
    mutationFn: async () => {
      if (activeWorkspace == null || workspaces.length === 0) return;

      dialog.show({
        id: 'export-data',
        title: 'Export App Data',
        size: 'md',
        noPadding: true,
        render: ({ hide }) => (
          <ExportDataDialog
            onHide={hide}
            workspaces={workspaces}
            activeWorkspace={activeWorkspace}
          />
        ),
      });
    },
  });
}
