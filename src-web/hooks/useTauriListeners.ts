import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';
import { useSidebarDisplay } from './useSidebarDisplay';

const unsubFns: (() => void)[] = [];

export function useTauriListeners() {
  const sidebarDisplay = useSidebarDisplay();
  useEffect(() => {
    let unmounted = false;

    listen('toggle_sidebar', async () => {
      sidebarDisplay.toggle();
    }).then((fn) => {
      if (unmounted) {
        fn();
      } else {
        unsubFns.push(fn);
      }
    });

    return () => {
      unmounted = true;
      for (const unsub of unsubFns) {
        unsub();
      }
    };
  }, []);
}
