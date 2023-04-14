import { useQueryClient } from '@tanstack/react-query';
import { appWindow } from '@tauri-apps/api/window';
import { keyValueQueryKey } from '../hooks/useKeyValue';
import { requestsQueryKey } from '../hooks/useRequests';
import { useRequestUpdateKey } from '../hooks/useRequestUpdateKey';
import { responsesQueryKey } from '../hooks/useResponses';
import { useTauriEvent } from '../hooks/useTauriEvent';
import { workspacesQueryKey } from '../hooks/useWorkspaces';
import { DEFAULT_FONT_SIZE } from '../lib/constants';
import { NAMESPACE_NO_SYNC } from '../lib/keyValueStore';
import type { HttpRequest, HttpResponse, Model, Workspace } from '../lib/models';
import { modelsEq } from '../lib/models';

export function GlobalHooks() {
  const queryClient = useQueryClient();
  const { wasUpdatedExternally } = useRequestUpdateKey(null);

  useTauriEvent<Model>('created_model', ({ payload, windowLabel }) => {
    if (shouldIgnoreEvent(payload, windowLabel)) return;

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
      console.log('Unrecognized created model:', payload);
      return;
    }

    if (!shouldIgnoreModel(payload)) {
      // Order newest first
      queryClient.setQueryData<Model[]>(queryKey, (values) => [payload, ...(values ?? [])]);
    }
  });

  useTauriEvent<Model>('updated_model', ({ payload, windowLabel }) => {
    if (shouldIgnoreEvent(payload, windowLabel)) return;

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

    if (payload.model === 'http_request') {
      wasUpdatedExternally(payload.id);
    }

    if (!shouldIgnoreModel(payload)) {
      queryClient.setQueryData<Model[]>(queryKey, (values) =>
        values?.map((v) => (modelsEq(v, payload) ? payload : v)),
      );
    }
  });

  useTauriEvent<Model>('deleted_model', ({ payload, windowLabel }) => {
    if (shouldIgnoreEvent(payload, windowLabel)) return;

    if (shouldIgnoreModel(payload)) return;

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

  return null;
}

function removeById<T extends { id: string }>(model: T) {
  return (entries: T[] | undefined) => entries?.filter((e) => e.id !== model.id);
}

const shouldIgnoreEvent = (payload: Model, windowLabel: string) =>
  windowLabel === appWindow.label && payload.model !== 'http_response';

const shouldIgnoreModel = (payload: Model) => {
  if (payload.model === 'key_value') {
    return payload.namespace === NAMESPACE_NO_SYNC;
  }
  return false;
};
