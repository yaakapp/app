import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { OpenDialogOptions } from '@tauri-apps/api/dialog';
import { open } from '@tauri-apps/api/dialog';
import { Button } from '../components/core/Button';
import { VStack } from '../components/core/Stacks';
import { useDialog } from '../components/DialogContext';
import type { Environment, Folder, GrpcRequest, HttpRequest, Workspace } from '../lib/models';
import { count } from '../lib/pluralize';
import { useAlert } from './useAlert';
import { useAppRoutes } from './useAppRoutes';

const openArgs: OpenDialogOptions = {
  filters: [{ name: 'Export File', extensions: ['json', 'yaml'] }],
  multiple: false,
};

export function useImportData() {
  const routes = useAppRoutes();
  const dialog = useDialog();
  const alert = useAlert();

  const importData = async () => {
    const selected = await open(openArgs);
    if (selected == null || selected.length === 0) {
      return;
    }

    const imported: {
      workspaces: Workspace[];
      environments: Environment[];
      folders: Folder[];
      httpRequests: HttpRequest[];
      grpcRequests: GrpcRequest[];
    } = await invoke('cmd_import_data', {
      filePaths: Array.isArray(selected) ? selected : [selected],
    });
    const importedWorkspace = imported.workspaces[0];

    dialog.show({
      id: 'import-complete',
      title: 'Import Complete',
      size: 'sm',
      hideX: true,
      render: ({ hide }) => {
        const { workspaces, environments, folders, httpRequests, grpcRequests } = imported;
        return (
          <VStack space={3} className="pb-4">
            <ul className="list-disc pl-6">
              <li>{count('Workspace', workspaces.length)}</li>
              <li>{count('Environment', environments.length)}</li>
              <li>{count('Folder', folders.length)}</li>
              <li>{count('HTTP Request', httpRequests.length)}</li>
              <li>{count('GRPC Request', grpcRequests.length)}</li>
            </ul>
            <div>
              <Button className="ml-auto" onClick={hide} color="primary">
                Done
              </Button>
            </div>
          </VStack>
        );
      },
    });

    if (importedWorkspace != null) {
      routes.navigate('workspace', {
        workspaceId: importedWorkspace.id,
        environmentId: imported.environments[0]?.id,
      });
    }
  };

  return useMutation({
    onError: (err: string) => {
      alert({ id: 'import-failed', title: 'Import Failed', body: err });
    },
    mutationFn: async () => {
      dialog.show({
        id: 'import',
        title: 'Import Data',
        size: 'sm',
        render: ({ hide }) => {
          return (
            <VStack space={3} className="pb-4">
              <p>Insomnia or Postman Collection v2/v2.1 formats are supported</p>
              <Button
                size="sm"
                color="primary"
                onClick={async () => {
                  await importData();
                  hide();
                }}
              >
                Select File
              </Button>
            </VStack>
          );
        },
      });
    },
  });
}
