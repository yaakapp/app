import { useQueryClient } from '@tanstack/react-query';
import { appWindow } from '@tauri-apps/api/window';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cookieJarsQueryKey } from '../hooks/useCookieJars';
import { keyValueQueryKey } from '../hooks/useKeyValue';
import { useListenToTauriEvent } from '../hooks/useListenToTauriEvent';
import { useRecentEnvironments } from '../hooks/useRecentEnvironments';
import { useRecentRequests } from '../hooks/useRecentRequests';
import { useRecentWorkspaces } from '../hooks/useRecentWorkspaces';
import { requestsQueryKey } from '../hooks/useRequests';
import { useRequestUpdateKey } from '../hooks/useRequestUpdateKey';
import { responsesQueryKey } from '../hooks/useResponses';
import { settingsQueryKey } from '../hooks/useSettings';
import { useSyncWindowTitle } from '../hooks/useSyncWindowTitle';
import { useSyncAppearance } from '../hooks/useSyncAppearance';
import { workspacesQueryKey } from '../hooks/useWorkspaces';
import { NAMESPACE_NO_SYNC } from '../lib/keyValueStore';
import type { HttpRequest, HttpResponse, Model, Workspace } from '../lib/models';
import { modelsEq } from '../lib/models';
import { setPathname } from '../lib/persistPathname';

const DEFAULT_FONT_SIZE = 16;

export function GlobalHooks() {
  // Include here so they always update, even
  // if no component references them
  useRecentWorkspaces();
  useRecentEnvironments();
  useRecentRequests();

  useSyncAppearance();

  useSyncWindowTitle();

  const queryClient = useQueryClient();
  const { wasUpdatedExternally } = useRequestUpdateKey(null);

  // Listen for location changes and update the pathname
  const location = useLocation();
  useEffect(() => {
    setPathname(location.pathname).catch(console.error);
  }, [location.pathname]);

  useListenToTauriEvent<Model>('created_model', ({ payload, windowLabel }) => {
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
        : payload.model === 'settings'
        ? settingsQueryKey()
        : payload.model === 'cookie_jar'
        ? cookieJarsQueryKey(payload)
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

  useListenToTauriEvent<Model>('updated_model', ({ payload, windowLabel }) => {
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
        : payload.model === 'cookie_jar'
        ? cookieJarsQueryKey(payload)
        : payload.model === 'settings'
        ? settingsQueryKey()
        : null;

    if (queryKey === null) {
      console.log('Unrecognized updated model:', payload);
      return;
    }

    if (payload.model === 'http_request') {
      wasUpdatedExternally(payload.id);
    }

    if (!shouldIgnoreModel(payload)) {
      console.time('set query date');
      queryClient.setQueryData<Model[]>(queryKey, (values) =>
        values?.map((v) => (modelsEq(v, payload) ? payload : v)),
      );
      console.timeEnd('set query date');
    }
  });

  useListenToTauriEvent<Model>('deleted_model', ({ payload, windowLabel }) => {
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
    } else if (payload.model === 'cookie_jar') {
      queryClient.setQueryData(cookieJarsQueryKey(payload), undefined);
    } else if (payload.model === 'settings') {
      queryClient.setQueryData(settingsQueryKey(), undefined);
    }
  });
  useListenToTauriEvent<number>('zoom', ({ payload: zoomDelta, windowLabel }) => {
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
