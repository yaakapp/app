import { hotkeyActions } from '../hooks/useHotKey';
import { HotKeyList } from './core/HotKeyList';

export const KeyboardShortcutsDialog = () => {
  return (
    <div className="h-full w-full">
      <HotKeyList hotkeys={hotkeyActions} />
    </div>
  );
};
