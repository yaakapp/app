import { useMutation } from '@tanstack/react-query';
import { useDialog } from '../components/DialogContext';
import Settings from '../components/Settings/Settings';
import { invokeCmd } from '../lib/tauri';
import { useActiveWorkspace } from './useActiveWorkspace';
import { useAppRoutes } from './useAppRoutes';
import { useOsInfo } from './useOsInfo';

export function useOpenSettings() {
  const routes = useAppRoutes();
  const workspace = useActiveWorkspace();
  const dialog = useDialog();
  const { osType } = useOsInfo();
  return useMutation({
    mutationKey: ['open_settings'],
    mutationFn: async () => {
      if (workspace == null) return;

      // HACK: Show settings in dialog on Linux until this is fixed: https://github.com/tauri-apps/tauri/issues/11171
      if (osType === 'linux') {
        dialog.show({
          id: 'settings',
          size: 'lg',
          render: ({ hide }) => <Settings hide={hide} />,
        });
        return;
      }

      await invokeCmd('cmd_new_child_window', {
        url: routes.paths.workspaceSettings({ workspaceId: workspace.id }),
        label: 'settings',
        title: 'Yaak Settings',
        innerSize: [600, 550],
      });
    },
  });
}
