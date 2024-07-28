import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { useEffect, useState } from 'react';

export function useWindowFocus() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let unsub: undefined | (() => void) = undefined;
    getCurrentWebviewWindow()
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
