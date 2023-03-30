import { useQueryClient } from '@tanstack/react-query';
import { listen } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';
import { useEffect } from 'react';
import { debounce } from '../lib/debounce';
import type { HttpRequest } from '../lib/models';
import { requestsQueryKey } from './useRequests';
import { useRequestUpdateKey } from './useRequestUpdateKey';
import { useSidebarDisplay } from './useSidebarDisplay';

const unsubFns: (() => void)[] = [];
export const UPDATE_DEBOUNCE_MILLIS = 1000;

export function useTauriListeners() {
  const sidebarDisplay = useSidebarDisplay();
  const queryClient = useQueryClient();
  const { wasUpdatedExternally } = useRequestUpdateKey(null);

  useEffect(() => {
    let unmounted = false;

    appWindow
      .listen('toggle_sidebar', async () => {
        sidebarDisplay.toggle();
      })
      .then((unsub) => {
        if (unmounted) unsub();
        else unsubFns.push(unsub);
      });

    listen('refresh', () => {
      location.reload();
    }).then((unsub) => {
      if (unmounted) unsub();
      else unsubFns.push(unsub);
    });

    appWindow
      .listen(
        'updated_request',
        debounce(({ payload: request }: { payload: HttpRequest }) => {
          queryClient.setQueryData(
            requestsQueryKey(request.workspaceId),
            (requests: HttpRequest[] = []) => {
              const newRequests = [];
              let found = false;
              for (const r of requests) {
                if (r.id === request.id) {
                  found = true;
                  newRequests.push(request);
                } else {
                  newRequests.push(r);
                }
              }
              if (!found) {
                newRequests.push(request);
              }
              setTimeout(() => wasUpdatedExternally(request.id), 50);
              return newRequests;
            },
          );
        }, UPDATE_DEBOUNCE_MILLIS),
      )
      .then((unsub) => {
        if (unmounted) unsub();
        else unsubFns.push(unsub);
      });

    return () => {
      unmounted = true;
      for (const unsub of unsubFns) {
        unsub();
      }
    };
  }, []);
}
