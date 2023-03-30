import { useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { EventCallback } from '@tauri-apps/api/event';
import { appWindow } from '@tauri-apps/api/window';
import { matchPath } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { DEFAULT_FONT_SIZE } from '../lib/constants';
import { debounce } from '../lib/debounce';
import { extractKeyValue, NAMESPACE_NO_SYNC } from '../lib/keyValueStore';
import type { HttpRequest, HttpResponse, KeyValue, Model, Workspace } from '../lib/models';
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
      appWindow.listen(event, fn).then((unsub) => {
        if (unmounted) unsub();
        else unsubFns.push(unsub);
      });
    }

    function listenDebounced<T>(event: string, fn: EventCallback<T>) {
      listen(event, debounce(fn, UPDATE_DEBOUNCE_MILLIS));
    }

    listen('toggle_sidebar', sidebarDisplay.toggle);
    listen('refresh', () => location.reload());

    listenDebounced('updated_key_value', ({ payload: keyValue }: { payload: KeyValue }) => {
      if (keyValue.namespace !== NAMESPACE_NO_SYNC) {
        queryClient.setQueryData(keyValueQueryKey(keyValue), extractKeyValue(keyValue));
      }
    });

    listenDebounced('updated_model', ({ payload }: { payload: Model }) => {
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
          console.log('Unrecognized updated model:', payload);
        }
        return;
      }

      const skipSync = payload.model === 'key_value' && payload.namespace === NAMESPACE_NO_SYNC;

      if (!skipSync) {
        queryClient.setQueryData(queryKey, (values: Model[] = []) => {
          const newValues = [];
          let found = false;
          for (const v of values) {
            if (modelsEq(v, payload)) {
              found = true;
              newValues.push(payload);
            } else {
              newValues.push(v);
            }
          }

          // Doesn't exist already, so add it to the list
          if (!found) newValues.push(payload);

          if (payload.model === 'http_request') {
            setTimeout(() => wasUpdatedExternally(payload.id), 50);
          }

          return newValues;
        });
      }
    });

    listen('deleted_model', ({ payload: model }: { payload: Model }) => {
      function removeById<T extends { id: string }>(model: T) {
        return (entries: T[] | undefined) => entries?.filter((e) => e.id !== model.id);
      }

      if (model.model === 'workspace') {
        queryClient.setQueryData(workspacesQueryKey(), removeById<Workspace>(model));
      } else if (model.model === 'http_request') {
        queryClient.setQueryData(requestsQueryKey(model), removeById<HttpRequest>(model));
      } else if (model.model === 'http_response') {
        queryClient.setQueryData(responsesQueryKey(model), removeById<HttpResponse>(model));
      } else if (model.model === 'key_value') {
        queryClient.setQueryData(keyValueQueryKey(model), undefined);
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
