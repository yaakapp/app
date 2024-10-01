import type { EventCallback, EventName } from '@tauri-apps/api/event';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { DependencyList } from 'react';
import { useEffect } from 'react';

/**
 * React hook to listen to a Tauri event.
 */
export function useListenToTauriEvent<T>(
  event: EventName,
  fn: EventCallback<T>,
  deps: DependencyList = [],
) {
  useEffect(() => {
    let unMounted = false;
    let unsubFn: (() => void) | undefined = undefined;

    listen(
      event,
      fn,
      // Listen to `emit_all()` events or events specific to the current window
      { target: { label: getCurrentWebviewWindow().label, kind: 'Window' } },
    ).then((unsub) => {
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
