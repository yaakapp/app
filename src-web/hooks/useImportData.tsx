import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { Button } from '../components/core/Button';
import { VStack } from '../components/core/Stacks';
import { useDialog } from '../components/DialogContext';
import type { Environment, Folder, GrpcRequest, HttpRequest, Workspace } from '../lib/models';
import { count } from '../lib/pluralize';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useAlert } from './useAlert';
import { useAppRoutes } from './useAppRoutes';

export function useImportData() {
  const routes = useAppRoutes();
  const dialog = useDialog();
  const alert = useAlert();
  const activeWorkspaceId = useActiveWorkspaceId();

  const importData = async () => {
    const selected = await open({
      filters: [{ name: 'Export File', extensions: ['json', 'yaml'] }],
      multiple: false,
    });
    if (selected == null) {
      return;
    }

    const imported: {
      workspaces: Workspace[];
      environments: Environment[];
      folders: Folder[];
      httpRequests: HttpRequest[];
      grpcRequests: GrpcRequest[];
    } = await invoke('cmd_import_data', {
      filePath: selected.path,
      workspaceId: activeWorkspaceId,
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
      return new Promise<void>((resolve, reject) => {
        dialog.show({
          id: 'import',
          title: 'Import Data',
          size: 'sm',
          render: ({ hide }) => {
            return (
              <VStack space={5} className="pb-4">
                <VStack space={1}>
                  <p>Supported Formats:</p>
                  <ul className="list-disc pl-5">
                    <li>Postman Collection v2/v2.1</li>
                    <li>Insomnia</li>
                  </ul>
                </VStack>
                <Button
                  size="sm"
                  color="primary"
                  onClick={async () => {
                    try {
                      await importData();
                      resolve();
                    } catch (err) {
                      reject(err);
                    }
                    hide();
                  }}
                >
                  Select File
                </Button>
              </VStack>
            );
          },
        });
      });
    },
  });
}
