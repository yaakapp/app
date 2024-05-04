import type { EventCallback, EventName, Options } from '@tauri-apps/api/event';
import { listen } from '@tauri-apps/api/event';
import type { DependencyList } from 'react';
import { useEffect } from 'react';

/**
 * React hook to listen to a Tauri event.
 */
export function useListenToTauriEvent<T>(
  event: EventName,
  fn: EventCallback<T>,
  options: Options | undefined = undefined,
  deps: DependencyList = [],
) {
  useEffect(() => {
    let unMounted = false;
    let unsubFn: (() => void) | undefined = undefined;

    listen(event, fn, options).then((unsub) => {
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
