import { useEffect, useRef } from 'react';

export type HotkeyAction =
  | 'request.send'
  | 'request.create'
  | 'request.duplicate'
  | 'sidebar.toggle'
  | 'sidebar.focus'
  | 'url.focus';

const hotkeys: Record<HotkeyAction, string[]> = {
  'request.send': ['Meta+Enter', 'Meta+r'],
  'request.create': ['Meta+n'],
  'request.duplicate': ['Meta+d'],
  'sidebar.toggle': ['Meta+b'],
  'sidebar.focus': ['Meta+1'],
  'url.focus': ['Meta+l'],
};

export function useHotkey(action: HotkeyAction | null, callback: (e: KeyboardEvent) => void) {
  const currentKeys = useRef<Set<string>>(new Set());
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      console.log('KEY DOWN', e.key);
      currentKeys.current.add(e.key);
      for (const [hkAction, hkKeys] of Object.entries(hotkeys)) {
        for (const hkKey of hkKeys) {
          const keys = hkKey.split('+');
          if (
            keys.length === currentKeys.current.size &&
            keys.every((key) => currentKeys.current.has(key)) &&
            hkAction === action
          ) {
            // Triggered hotkey!
            console.log('TRIGGER!', action);
            e.preventDefault();
            e.stopPropagation();
            callbackRef.current(e);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [action, callback]);
}
