import { hotkeyActions } from '../hooks/useHotKey';
import { HotKeyList } from './core/HotKeyList';

export function KeyboardShortcutsDialog() {
  return (
    <div className="h-full w-full pb-2">
      <HotKeyList hotkeys={hotkeyActions} />
    </div>
  );
}
