import { useEffect, useRef } from 'react';
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
  'request.send': ['Meta+Enter', 'Meta+r'],
  'request.create': ['Meta+n'],
  'request.duplicate': ['Meta+d'],
  'sidebar.toggle': ['Meta+b'],
  'sidebar.focus': ['Meta+1'],
  'urlBar.focus': ['Meta+l'],
  'environmentEditor.toggle': ['Meta+e'],
};

export function useHotkey(action: HotkeyAction | null, callback: (e: KeyboardEvent) => void) {
  useAnyHotkey((hkAction, e) => {
    if (hkAction === action) {
      callback(e);
    }
  });
}

export function useAnyHotkey(callback: (action: HotkeyAction, e: KeyboardEvent) => void) {
  const currentKeys = useRef<Set<string>>(new Set());
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      currentKeys.current.add(e.key);
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
    };
    const up = (e: KeyboardEvent) => {
      currentKeys.current.delete(e.key);
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);
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
      if (p === 'Meta') {
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
      if (p === 'Meta') {
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
