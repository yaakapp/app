import type { OsType } from '@tauri-apps/api/os';
import { useEffect, useRef } from 'react';
import { capitalize } from '../lib/capitalize';
import { debounce } from '../lib/debounce';
import { useOsInfo } from './useOsInfo';

export type HotkeyAction =
  | 'environmentEditor.toggle'
  | 'grpc.send'
  | 'hotkeys.showHelp'
  | 'request.create'
  | 'request.duplicate'
  | 'request.send'
  | 'requestSwitcher.next'
  | 'requestSwitcher.prev'
  | 'settings.show'
  | 'sidebar.focus'
  | 'sidebar.toggle'
  | 'urlBar.focus';

const hotkeys: Record<HotkeyAction, string[]> = {
  'environmentEditor.toggle': ['CmdCtrl+Shift+e'],
  'grpc.send': ['CmdCtrl+Enter', 'CmdCtrl+r'],
  'hotkeys.showHelp': ['CmdCtrl+Shift+/'],
  'request.create': ['CmdCtrl+n'],
  'request.duplicate': ['CmdCtrl+d'],
  'request.send': ['CmdCtrl+Enter', 'CmdCtrl+r'],
  'requestSwitcher.next': ['Control+Shift+Tab'],
  'requestSwitcher.prev': ['Control+Tab'],
  'settings.show': ['CmdCtrl+,'],
  'sidebar.focus': ['CmdCtrl+1'],
  'sidebar.toggle': ['CmdCtrl+b'],
  'urlBar.focus': ['CmdCtrl+l'],
};

const hotkeyLabels: Record<HotkeyAction, string> = {
  'environmentEditor.toggle': 'Edit Environments',
  'grpc.send': 'Send Message',
  'hotkeys.showHelp': 'Show Keyboard Shortcuts',
  'request.create': 'New Request',
  'request.duplicate': 'Duplicate Request',
  'request.send': 'Send Request',
  'requestSwitcher.next': 'Go To Previous Request',
  'requestSwitcher.prev': 'Go To Next Request',
  'settings.show': 'Open Settings',
  'sidebar.focus': 'Focus Sidebar',
  'sidebar.toggle': 'Toggle Sidebar',
  'urlBar.focus': 'Focus URL',
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
  useAnyHotkey((hkAction, e) => {
    if (hkAction === action) {
      callback(e);
    }
  }, options);
}

export function useAnyHotkey(
  callback: (action: HotkeyAction, e: KeyboardEvent) => void,
  options: Options,
) {
  const currentKeys = useRef<Set<string>>(new Set());
  const callbackRef = useRef(callback);
  const osInfo = useOsInfo();
  const os = osInfo?.osType ?? null;

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Sometimes the keyup event doesn't fire, so we clear the keys after a timeout
    const clearCurrentKeys = debounce(() => currentKeys.current.clear(), 1000);

    const down = (e: KeyboardEvent) => {
      if (options.enable === false) {
        return;
      }

      currentKeys.current.add(normalizeKey(e.key, os));

      for (const [hkAction, hkKeys] of Object.entries(hotkeys) as [HotkeyAction, string[]][]) {
        for (const hkKey of hkKeys) {
          const keys = hkKey.split('+');
          if (
            keys.length === currentKeys.current.size &&
            keys.every((key) => currentKeys.current.has(key))
          ) {
            // Triggered hotkey!
            e.preventDefault();
            e.stopPropagation();
            callbackRef.current(hkAction, e);
          }
        }
      }
      clearCurrentKeys();
    };
    const up = (e: KeyboardEvent) => {
      if (options.enable === false) {
        return;
      }
      currentKeys.current.delete(normalizeKey(e.key, os));
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [options.enable, os]);
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
