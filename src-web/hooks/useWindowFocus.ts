import { appWindow } from '@tauri-apps/api/window';
import { useEffect, useState } from 'react';

export function useWindowFocus() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let unsub: undefined | (() => void) = undefined;
    appWindow
      .onFocusChanged((e) => {
        setVisible(e.payload);
      })
      .then((fn) => {
        unsub = fn;
      });
    return () => unsub?.();
  }, []);

  return visible;
}
