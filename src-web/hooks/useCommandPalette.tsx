import { CommandPalette } from '../components/CommandPalette';
import { useDialog } from '../components/DialogContext';
import { useHotKey } from './useHotKey';

export function useCommandPalette() {
  const dialog = useDialog();
  useHotKey('command_palette.toggle', () => {
    dialog.toggle({
      id: 'command_palette',
      size: 'dynamic',
      hideX: true,
      className: '!max-h-[min(30rem,calc(100vh-4rem))]',
      vAlign: 'top',
      noPadding: true,
      noScroll: true,
      render: ({ hide }) => <CommandPalette onClose={hide} />,
    });
  });
}
