import { useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { EventCallback } from '@tauri-apps/api/event';
import { listen as tauriListen } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';
import { matchPath } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { DEFAULT_FONT_SIZE } from '../lib/constants';
import { debounce } from '../lib/debounce';
import { NAMESPACE_NO_SYNC } from '../lib/keyValueStore';
import type { HttpRequest, HttpResponse, Model, Workspace } from '../lib/models';
import { modelsEq } from '../lib/models';
import { keyValueQueryKey } from './useKeyValue';
import { requestsQueryKey } from './useRequests';
import { useRequestUpdateKey } from './useRequestUpdateKey';
import { responsesQueryKey } from './useResponses';
import { routePaths } from './useRoutes';
import { useSidebarDisplay } from './useSidebarDisplay';
import { workspacesQueryKey } from './useWorkspaces';

const unsubFns: (() => void)[] = [];
export const UPDATE_DEBOUNCE_MILLIS = 100;

export function useTauriListeners() {
  const sidebarDisplay = useSidebarDisplay();
  const queryClient = useQueryClient();
  const { wasUpdatedExternally } = useRequestUpdateKey(null);

  useEffectOnce(() => {
    let unmounted = false;

    // eslint-disable-next-line @typescript-eslint/ban-types
    function listen<T>(event: string, fn: EventCallback<T>) {
      tauriListen(event, fn).then((unsub) => {
        if (unmounted) unsub();
        else unsubFns.push(unsub);
      });
    }

    function listenDebounced<T>(event: string, fn: EventCallback<T>) {
      listen(event, debounce(fn, UPDATE_DEBOUNCE_MILLIS));
    }

    listen('toggle_sidebar', sidebarDisplay.toggle);
    listen('refresh', () => location.reload());

    listenDebounced<Model>('created_model', ({ payload, windowLabel }) => {
      const cameFromSameWindow = windowLabel === appWindow.label;
      if (cameFromSameWindow) return;

      const queryKey =
        payload.model === 'http_request'
          ? requestsQueryKey(payload)
          : payload.model === 'http_response'
          ? responsesQueryKey(payload)
          : payload.model === 'workspace'
          ? workspacesQueryKey(payload)
          : payload.model === 'key_value'
          ? keyValueQueryKey(payload)
          : null;

      if (queryKey === null) {
        if (payload.model) {
          console.log('Unrecognized created model:', payload);
        }
        return;
      }

      const skipSync = payload.model === 'key_value' && payload.namespace === NAMESPACE_NO_SYNC;

      if (!skipSync) {
        queryClient.setQueryData<Model[]>(queryKey, (values) => [...(values ?? []), payload]);
      }
    });

    listenDebounced<Model>('updated_model', ({ payload, windowLabel }) => {
      const cameFromSameWindow = windowLabel === appWindow.label;
      if (cameFromSameWindow) return;

      const queryKey =
        payload.model === 'http_request'
          ? requestsQueryKey(payload)
          : payload.model === 'http_response'
          ? responsesQueryKey(payload)
          : payload.model === 'workspace'
          ? workspacesQueryKey(payload)
          : payload.model === 'key_value'
          ? keyValueQueryKey(payload)
          : null;

      if (queryKey === null) {
        console.log('Unrecognized updated model:', payload);
        return;
      }

      const skipSync = payload.model === 'key_value' && payload.namespace === NAMESPACE_NO_SYNC;

      if (payload.model === 'http_request') {
        wasUpdatedExternally(payload.id);
      }

      if (!skipSync) {
        queryClient.setQueryData<Model[]>(queryKey, (values) =>
          values?.map((v) => (modelsEq(v, payload) ? payload : v)),
        );
      }
    });

    listen<Model>('deleted_model', ({ payload }) => {
      function removeById<T extends { id: string }>(model: T) {
        return (entries: T[] | undefined) => entries?.filter((e) => e.id !== model.id);
      }

      if (payload.model === 'workspace') {
        queryClient.setQueryData<Workspace[]>(workspacesQueryKey(), removeById(payload));
      } else if (payload.model === 'http_request') {
        queryClient.setQueryData<HttpRequest[]>(requestsQueryKey(payload), removeById(payload));
      } else if (payload.model === 'http_response') {
        queryClient.setQueryData<HttpResponse[]>(responsesQueryKey(payload), removeById(payload));
      } else if (payload.model === 'key_value') {
        queryClient.setQueryData(keyValueQueryKey(payload), undefined);
      }
    });

    listen('send_request', async () => {
      const params = matchPath(routePaths.request(), window.location.pathname);
      const requestId = params?.params.requestId;
      if (typeof requestId !== 'string') {
        return;
      }
      await invoke('send_request', { requestId });
    });

    listen('zoom', ({ payload: zoomDelta }: { payload: number }) => {
      const fontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize);

      let newFontSize;
      if (zoomDelta === 0) {
        newFontSize = DEFAULT_FONT_SIZE;
      } else if (zoomDelta > 0) {
        newFontSize = Math.min(fontSize * 1.1, DEFAULT_FONT_SIZE * 5);
      } else if (zoomDelta < 0) {
        newFontSize = Math.max(fontSize * 0.9, DEFAULT_FONT_SIZE * 0.4);
      }

      document.documentElement.style.fontSize = `${newFontSize}px`;
    });

    return () => {
      unmounted = true;
      for (const unsub of unsubFns) {
        unsub();
      }
    };
  });
}
