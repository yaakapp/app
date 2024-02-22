import { useQueryClient } from '@tanstack/react-query';
import { appWindow } from '@tauri-apps/api/window';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cookieJarsQueryKey } from '../hooks/useCookieJars';
import { grpcConnectionsQueryKey } from '../hooks/useGrpcConnections';
import { grpcEventsQueryKey } from '../hooks/useGrpcEvents';
import { grpcRequestsQueryKey } from '../hooks/useGrpcRequests';
import { httpRequestsQueryKey } from '../hooks/useHttpRequests';
import { httpResponsesQueryKey } from '../hooks/useHttpResponses';
import { keyValueQueryKey } from '../hooks/useKeyValue';
import { useListenToTauriEvent } from '../hooks/useListenToTauriEvent';
import { useRecentEnvironments } from '../hooks/useRecentEnvironments';
import { useRecentRequests } from '../hooks/useRecentRequests';
import { useRecentWorkspaces } from '../hooks/useRecentWorkspaces';
import { useRequestUpdateKey } from '../hooks/useRequestUpdateKey';
import { settingsQueryKey } from '../hooks/useSettings';
import { useSyncAppearance } from '../hooks/useSyncAppearance';
import { useSyncWindowTitle } from '../hooks/useSyncWindowTitle';
import { workspacesQueryKey } from '../hooks/useWorkspaces';
import { NAMESPACE_NO_SYNC } from '../lib/keyValueStore';
import type { Model } from '../lib/models';
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

  useListenToTauriEvent<Model>('upserted_model', ({ payload, windowLabel }) => {
    const queryKey =
      payload.model === 'http_request'
        ? httpRequestsQueryKey(payload)
        : payload.model === 'http_response'
        ? httpResponsesQueryKey(payload)
        : payload.model === 'grpc_connection'
        ? grpcConnectionsQueryKey(payload)
        : payload.model === 'grpc_event'
        ? grpcEventsQueryKey(payload)
        : payload.model === 'grpc_request'
        ? grpcRequestsQueryKey(payload)
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

    if (payload.model === 'http_request' && windowLabel !== appWindow.label) {
      wasUpdatedExternally(payload.id);
    }

    const pushToFront = (['http_response', 'grpc_connection'] as Model['model'][]).includes(
      payload.model,
    );

    if (shouldIgnoreModel(payload)) return;

    queryClient.setQueryData<Model[]>(queryKey, (values = []) => {
      const index = values.findIndex((v) => modelsEq(v, payload)) ?? -1;
      if (index >= 0) {
        // console.log('UPDATED', payload);
        return [...values.slice(0, index), payload, ...values.slice(index + 1)];
      } else {
        // console.log('CREATED', payload);
        return pushToFront ? [payload, ...(values ?? [])] : [...(values ?? []), payload];
      }
    });
  });

  useListenToTauriEvent<Model>('deleted_model', ({ payload }) => {
    if (shouldIgnoreModel(payload)) return;

    if (payload.model === 'workspace') {
      queryClient.setQueryData(workspacesQueryKey(), removeById(payload));
    } else if (payload.model === 'http_request') {
      queryClient.setQueryData(httpRequestsQueryKey(payload), removeById(payload));
    } else if (payload.model === 'http_response') {
      queryClient.setQueryData(httpResponsesQueryKey(payload), removeById(payload));
    } else if (payload.model === 'grpc_request') {
      queryClient.setQueryData(grpcRequestsQueryKey(payload), removeById(payload));
    } else if (payload.model === 'grpc_connection') {
      queryClient.setQueryData(grpcConnectionsQueryKey(payload), removeById(payload));
    } else if (payload.model === 'grpc_event') {
      queryClient.setQueryData(grpcEventsQueryKey(payload), removeById(payload));
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

const shouldIgnoreModel = (payload: Model) => {
  if (payload.model === 'key_value') {
    return payload.namespace === NAMESPACE_NO_SYNC;
  }
  return false;
};
