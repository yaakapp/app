import type { OsType } from '@tauri-apps/api/os';
import { useEffect, useRef } from 'react';
import { capitalize } from '../lib/capitalize';
import { debounce } from '../lib/debounce';
import { useOsInfo } from './useOsInfo';

const HOLD_KEYS = ['Shift', 'Control', 'Command', 'Alt', 'Meta'];

export type HotkeyAction =
  | 'environmentEditor.toggle'
  | 'hotkeys.showHelp'
  | 'grpc_request.send'
  | 'http_request.create'
  | 'http_request.duplicate'
  | 'http_request.send'
  | 'request_switcher.next'
  | 'request_switcher.prev'
  | 'request_switcher.toggle'
  | 'settings.show'
  | 'sidebar.focus'
  | 'sidebar.toggle'
  | 'urlBar.focus'
  | 'command_palette.toggle';

const hotkeys: Record<HotkeyAction, string[]> = {
  'environmentEditor.toggle': ['CmdCtrl+Shift+e'],
  'grpc_request.send': ['CmdCtrl+Enter', 'CmdCtrl+r'],
  'hotkeys.showHelp': ['CmdCtrl+Shift+/'],
  'http_request.create': ['CmdCtrl+n'],
  'http_request.duplicate': ['CmdCtrl+d'],
  'http_request.send': ['CmdCtrl+Enter', 'CmdCtrl+r'],
  'request_switcher.next': ['Control+Shift+Tab'],
  'request_switcher.prev': ['Control+Tab'],
  'request_switcher.toggle': ['CmdCtrl+p'],
  'settings.show': ['CmdCtrl+,'],
  'sidebar.focus': ['CmdCtrl+1'],
  'sidebar.toggle': ['CmdCtrl+b'],
  'urlBar.focus': ['CmdCtrl+l'],
  'command_palette.toggle': ['CmdCtrl+k'],
};

const hotkeyLabels: Record<HotkeyAction, string> = {
  'environmentEditor.toggle': 'Edit Environments',
  'grpc_request.send': 'Send Message',
  'hotkeys.showHelp': 'Show Keyboard Shortcuts',
  'http_request.create': 'New Request',
  'http_request.duplicate': 'Duplicate Request',
  'http_request.send': 'Send Request',
  'request_switcher.next': 'Go To Previous Request',
  'request_switcher.prev': 'Go To Next Request',
  'request_switcher.toggle': 'Toggle Request Switcher',
  'settings.show': 'Open Settings',
  'sidebar.focus': 'Focus Sidebar',
  'sidebar.toggle': 'Toggle Sidebar',
  'urlBar.focus': 'Focus URL',
  'command_palette.toggle': 'Toggle Command Palette',
};

export const hotkeyActions: HotkeyAction[] = Object.keys(hotkeys) as (keyof typeof hotkeys)[];

interface Options {
  enable?: boolean;
}

export function useHotKey(
  action: HotkeyAction | null,
  callback: (e: KeyboardEvent) => void,
  options: Options = {},
) {
  const currentKeys = useRef<Set<string>>(new Set());
  const callbackRef = useRef(callback);
  const osInfo = useOsInfo();
  const os = osInfo?.osType ?? null;

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Sometimes the keyup event doesn't fire (eg, cmd+Tab), so we clear the keys after a timeout
    const clearCurrentKeys = debounce(() => currentKeys.current.clear(), 5000);

    const down = (e: KeyboardEvent) => {
      if (options.enable === false) {
        return;
      }

      const key = normalizeKey(e.key, os);

      // Don't add hold keys
      if (HOLD_KEYS.includes(key)) {
        return;
      }

      currentKeys.current.add(key);

      const currentKeysWithModifiers = new Set(currentKeys.current);
      if (e.altKey) currentKeysWithModifiers.add(normalizeKey('Alt', os));
      if (e.ctrlKey) currentKeysWithModifiers.add(normalizeKey('Control', os));
      if (e.metaKey) currentKeysWithModifiers.add(normalizeKey('Meta', os));
      if (e.shiftKey) currentKeysWithModifiers.add(normalizeKey('Shift', os));

      for (const [hkAction, hkKeys] of Object.entries(hotkeys) as [HotkeyAction, string[]][]) {
        for (const hkKey of hkKeys) {
          if (hkAction !== action) {
            continue;
          }

          const keys = hkKey.split('+');
          if (
            keys.length === currentKeysWithModifiers.size &&
            keys.every((key) => currentKeysWithModifiers.has(key))
          ) {
            e.preventDefault();
            e.stopPropagation();
            callbackRef.current(e);
          }
        }
      }

      clearCurrentKeys();
    };
    const up = (e: KeyboardEvent) => {
      if (options.enable === false) {
        return;
      }
      const key = normalizeKey(e.key, os);
      currentKeys.current.delete(key);

      // Clear all keys if no longer holding modifier
      // HACK: This is to get around the case of DOWN SHIFT -> DOWN : -> UP SHIFT -> UP ;
      //  As you see, the ":" is not removed because it turned into ";" when shift was released
      const isHoldingModifier = e.altKey || e.ctrlKey || e.metaKey || e.shiftKey;
      if (!isHoldingModifier) {
        currentKeys.current.clear();
      }
    };
    document.addEventListener('keydown', down, { capture: true });
    document.addEventListener('keyup', up, { capture: true });
    return () => {
      document.removeEventListener('keydown', down, { capture: true });
      document.removeEventListener('keyup', up, { capture: true });
    };
  }, [action, options.enable, os]);
}

export function useHotKeyLabel(action: HotkeyAction): string {
  return hotkeyLabels[action];
}

export function useFormattedHotkey(action: HotkeyAction | null): string[] | null {
  const osInfo = useOsInfo();
  const trigger = action != null ? hotkeys[action]?.[0] ?? null : null;
  if (trigger == null || osInfo == null) {
    return null;
  }

  const os = osInfo.osType;
  const parts = trigger.split('+');
  const labelParts: string[] = [];

  for (const p of parts) {
    if (os === 'Darwin') {
      if (p === 'CmdCtrl') {
        labelParts.push('⌘');
      } else if (p === 'Shift') {
        labelParts.push('⇧');
      } else if (p === 'Control') {
        labelParts.push('⌃');
      } else if (p === 'Enter') {
        labelParts.push('↩');
      } else if (p === 'Tab') {
        labelParts.push('⇥');
      } else {
        labelParts.push(capitalize(p));
      }
    } else {
      if (p === 'CmdCtrl') {
        labelParts.push('Ctrl');
      } else {
        labelParts.push(capitalize(p));
      }
    }
  }

  if (os === 'Darwin') {
    return labelParts;
  } else {
    return [labelParts.join('+')];
  }
}

const normalizeKey = (key: string, os: OsType | null) => {
  if (key === 'Meta' && os === 'Darwin') return 'CmdCtrl';
  else if (key === 'Control' && os !== 'Darwin') return 'CmdCtrl';
  else return key;
};
