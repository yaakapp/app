import type { OsType } from '@tauri-apps/api/os';
import { useEffect, useRef } from 'react';
import { debounce } from '../lib/debounce';
import { useOsInfo } from './useOsInfo';

export type HotkeyAction =
  | 'request.send'
  | 'request.create'
  | 'request.duplicate'
  | 'sidebar.toggle'
  | 'sidebar.focus'
  | 'urlBar.focus'
  | 'environmentEditor.toggle';

const hotkeys: Record<HotkeyAction, string[]> = {
  'request.send': ['CmdCtrl+Enter', 'CmdCtrl+r'],
  'request.create': ['CmdCtrl+n'],
  'request.duplicate': ['CmdCtrl+d'],
  'sidebar.toggle': ['CmdCtrl+b'],
  'sidebar.focus': ['CmdCtrl+1'],
  'urlBar.focus': ['CmdCtrl+l'],
  'environmentEditor.toggle': ['CmdCtrl+e'],
};

interface Options {
  enable?: boolean;
}

export function useHotkey(
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

export function useHotKeyLabel(action: HotkeyAction | null): string {
  switch (action) {
    case 'request.send':
      return 'Send Request';
    case 'request.create':
      return 'New Request';
    case 'request.duplicate':
      return 'Duplicate Request';
    case 'sidebar.toggle':
      return 'Toggle Sidebar';
    case 'sidebar.focus':
      return 'Focus Sidebar';
    case 'urlBar.focus':
      return 'Focus URL';
    case 'environmentEditor.toggle':
      return 'Edit Environments';
    default:
      return 'Unknown';
  }
}

export function useFormattedHotkey(action: HotkeyAction | null): string | null {
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
      } else {
        labelParts.push(p.toUpperCase());
      }
    } else {
      if (p === 'CmdCtrl') {
        labelParts.push('Ctrl');
      } else {
        labelParts.push(p);
      }
    }
  }

  if (os === 'Darwin') {
    return labelParts.join('');
  } else {
    return labelParts.join('+');
  }
}

const normalizeKey = (key: string, os: OsType | null) => {
  if (key === 'Meta' && os === 'Darwin') return 'CmdCtrl';
  else if (key === 'Control' && os !== 'Darwin') return 'CmdCtrl';
  else return key;
};
