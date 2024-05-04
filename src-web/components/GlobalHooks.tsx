import { useQueryClient } from '@tanstack/react-query';
import { getCurrent } from '@tauri-apps/api/webviewWindow';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCommandPalette } from '../hooks/useCommandPalette';
import { cookieJarsQueryKey } from '../hooks/useCookieJars';
import { foldersQueryKey } from '../hooks/useFolders';
import { useGlobalCommands } from '../hooks/useGlobalCommands';
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
  useGlobalCommands();
  useCommandPalette();

  const queryClient = useQueryClient();
  const { wasUpdatedExternally } = useRequestUpdateKey(null);

  // Listen for location changes and update the pathname
  const location = useLocation();
  useEffect(() => {
    setPathname(location.pathname).catch(console.error);
  }, [location.pathname]);

  interface ModelPayload {
    model: Model;
    windowLabel: string;
  }

  useListenToTauriEvent<ModelPayload>('upserted_model', ({ payload }) => {
    const { model, windowLabel } = payload;
    const queryKey =
      model.model === 'http_request'
        ? httpRequestsQueryKey(model)
        : model.model === 'http_response'
        ? httpResponsesQueryKey(model)
        : model.model === 'folder'
        ? foldersQueryKey(model)
        : model.model === 'grpc_connection'
        ? grpcConnectionsQueryKey(model)
        : model.model === 'grpc_event'
        ? grpcEventsQueryKey(model)
        : model.model === 'grpc_request'
        ? grpcRequestsQueryKey(model)
        : model.model === 'workspace'
        ? workspacesQueryKey(model)
        : model.model === 'key_value'
        ? keyValueQueryKey(model)
        : model.model === 'cookie_jar'
        ? cookieJarsQueryKey(model)
        : model.model === 'settings'
        ? settingsQueryKey()
        : null;

    if (queryKey === null) {
      console.log('Unrecognized updated model:', model);
      return;
    }

    if (model.model === 'http_request' && windowLabel !== getCurrent().label) {
      wasUpdatedExternally(model.id);
    }

    const pushToFront = (['http_response', 'grpc_connection'] as Model['model'][]).includes(
      model.model,
    );

    if (shouldIgnoreModel(model)) return;

    queryClient.setQueryData<Model[]>(queryKey, (values = []) => {
      const index = values.findIndex((v) => modelsEq(v, model)) ?? -1;
      if (index >= 0) {
        // console.log('UPDATED', payload);
        return [...values.slice(0, index), model, ...values.slice(index + 1)];
      } else {
        // console.log('CREATED', payload);
        return pushToFront ? [model, ...(values ?? [])] : [...(values ?? []), model];
      }
    });
  });

  useListenToTauriEvent<ModelPayload>('deleted_model', ({ payload }) => {
    const { model } = payload;
    if (shouldIgnoreModel(model)) return;

    if (model.model === 'workspace') {
      queryClient.setQueryData(workspacesQueryKey(), removeById(model));
    } else if (model.model === 'http_request') {
      queryClient.setQueryData(httpRequestsQueryKey(model), removeById(model));
    } else if (model.model === 'http_response') {
      queryClient.setQueryData(httpResponsesQueryKey(model), removeById(model));
    } else if (model.model === 'folder') {
      queryClient.setQueryData(foldersQueryKey(model), removeById(model));
    } else if (model.model === 'grpc_request') {
      queryClient.setQueryData(grpcRequestsQueryKey(model), removeById(model));
    } else if (model.model === 'grpc_connection') {
      queryClient.setQueryData(grpcConnectionsQueryKey(model), removeById(model));
    } else if (model.model === 'grpc_event') {
      queryClient.setQueryData(grpcEventsQueryKey(model), removeById(model));
    } else if (model.model === 'key_value') {
      queryClient.setQueryData(keyValueQueryKey(model), undefined);
    } else if (model.model === 'cookie_jar') {
      queryClient.setQueryData(cookieJarsQueryKey(model), undefined);
    } else if (model.model === 'settings') {
      queryClient.setQueryData(settingsQueryKey(), undefined);
    }
  });

  useListenToTauriEvent<number>(
    'zoom',
    ({ payload: zoomDelta }) => {
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
    },
    {
      target: { kind: 'WebviewWindow', label: getCurrent().label },
    },
  );

  return null;
}

function removeById<T extends { id: string }>(model: T) {
  return (entries: T[] | undefined) => entries?.filter((e) => e.id !== model.id);
}

const shouldIgnoreModel = (payload: Model) => {
  if (payload.model === 'key_value') {
    return payload.namespace === 'no_sync';
  }
  return false;
};
