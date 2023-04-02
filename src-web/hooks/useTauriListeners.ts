import { useQueryClient } from '@tanstack/react-query';
import { appWindow } from '@tauri-apps/api/window';
import { DEFAULT_FONT_SIZE } from '../lib/constants';
import { debounce } from '../lib/debounce';
import { NAMESPACE_NO_SYNC } from '../lib/keyValueStore';
import type { HttpRequest, HttpResponse, Model, Workspace } from '../lib/models';
import { modelsEq } from '../lib/models';
import { keyValueQueryKey } from './useKeyValue';
import { requestsQueryKey } from './useRequests';
import { useRequestUpdateKey } from './useRequestUpdateKey';
import { responsesQueryKey } from './useResponses';
import { useTauriEvent } from './useTauriEvent';
import { workspacesQueryKey } from './useWorkspaces';

export function useTauriListeners() {
  const queryClient = useQueryClient();
  const { wasUpdatedExternally } = useRequestUpdateKey(null);

  useTauriEvent<Model>('created_model', ({ payload, windowLabel }) => {
    if (windowLabel === appWindow.label && payload.model !== 'http_response') return;

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

  useTauriEvent<Model>(
    'updated_model',
    debounce(({ payload, windowLabel }) => {
      if (windowLabel === appWindow.label && payload.model !== 'http_response') return;

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

      if (payload.model === 'http_request') {
        wasUpdatedExternally(payload.id);
      }

      if (!skipSync) {
        queryClient.setQueryData<Model[]>(queryKey, (values) =>
          values?.map((v) => (modelsEq(v, payload) ? payload : v)),
        );
      }
    }, 500),
  );

  useTauriEvent<Model>('deleted_model', ({ payload }) => {
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

  useTauriEvent<number>('zoom', ({ payload: zoomDelta, windowLabel }) => {
    if (windowLabel !== appWindow.label) return;
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
}
