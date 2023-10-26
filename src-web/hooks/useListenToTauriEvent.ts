import type { EventCallback } from '@tauri-apps/api/event';
import { listen as tauriListen } from '@tauri-apps/api/event';
import type { DependencyList } from 'react';
import { useEffect } from 'react';

/**
  * React hook to listen to a Tauri event.
  */
export function useListenToTauriEvent<T>(event: string, fn: EventCallback<T>, deps: DependencyList = []) {
  useEffect(() => {
    let unMounted = false;
    let unsubFn: (() => void) | undefined = undefined;

    tauriListen(event, fn).then((unsub) => {
      if (unMounted) unsub();
      else unsubFn = unsub;
    });

    return () => {
      unMounted = true;
      unsubFn?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, fn, ...deps]);
}
