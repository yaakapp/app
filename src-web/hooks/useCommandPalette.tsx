import { CommandPalette } from '../components/CommandPalette';
import { useDialog } from '../components/DialogContext';
import { useAppInfo } from './useAppInfo';
import { useHotKey } from './useHotKey';

export function useCommandPalette() {
  const dialog = useDialog();
  const appInfo = useAppInfo();
  useHotKey('command_palette.toggle', () => {
    // Disabled in production for now
    if (!appInfo?.isDev) {
      return;
    }

    dialog.toggle({
      id: 'command_palette',
      size: 'md',
      hideX: true,
      noPadding: true,
      noScroll: true,
      render: ({ hide }) => <CommandPalette onClose={hide} />,
    });
  });
}
