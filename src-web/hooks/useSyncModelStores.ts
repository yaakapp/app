import { useQueryClient } from '@tanstack/react-query';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { AnyModel } from '@yaakapp-internal/models';
import { useSetAtom } from 'jotai/index';
import { extractKeyValue } from '../lib/keyValueStore';
import { modelsEq } from '../lib/model_util';
import { cookieJarsAtom } from './useCookieJars';
import { environmentsAtom } from './useEnvironments';
import { foldersAtom } from './useFolders';
import { grpcConnectionsAtom } from './useGrpcConnections';
import { grpcEventsQueryKey } from './useGrpcEvents';
import { grpcRequestsAtom } from './useGrpcRequests';
import { httpRequestsAtom } from './useHttpRequests';
import { httpResponsesAtom } from './useHttpResponses';
import { keyValueQueryKey } from './useKeyValue';
import { useListenToTauriEvent } from './useListenToTauriEvent';
import { pluginsAtom } from './usePlugins';
import { useRequestUpdateKey } from './useRequestUpdateKey';
import { settingsAtom } from './useSettings';
import { workspacesAtom } from './useWorkspaces';

export interface ModelPayload {
  model: AnyModel;
  windowLabel: string;
}

export function useSyncModelStores() {
  const queryClient = useQueryClient();
  const { wasUpdatedExternally } = useRequestUpdateKey(null);

  const setSettings = useSetAtom(settingsAtom);
  const setWorkspaces = useSetAtom(workspacesAtom);
  const setCookieJars = useSetAtom(cookieJarsAtom);
  const setFolders = useSetAtom(foldersAtom);
  const setPlugins = useSetAtom(pluginsAtom);
  const setHttpRequests = useSetAtom(httpRequestsAtom);
  const setHttpResponses = useSetAtom(httpResponsesAtom);
  const setGrpcConnections = useSetAtom(grpcConnectionsAtom);
  const setGrpcRequests = useSetAtom(grpcRequestsAtom);
  const setEnvironments = useSetAtom(environmentsAtom);

  useListenToTauriEvent<ModelPayload>('upserted_model', ({ payload }) => {
    if (payload.model.model !== 'key_value') {
      console.log('Upserted model', payload.model);
    }
    const { model, windowLabel } = payload;
    const queryKey =
      model.model === 'grpc_event'
        ? grpcEventsQueryKey(model)
        : model.model === 'key_value'
          ? keyValueQueryKey(model)
          : null;

    if (model.model === 'http_request' && windowLabel !== getCurrentWebviewWindow().label) {
      wasUpdatedExternally(model.id);
    }

    const pushToFront = (['http_response', 'grpc_connection'] as AnyModel['model'][]).includes(
      model.model,
    );

    if (shouldIgnoreModel(model, windowLabel)) return;

    if (model.model === 'workspace') {
      setWorkspaces(updateModelList(model, pushToFront));
    } else if (model.model === 'plugin') {
      setPlugins(updateModelList(model, pushToFront));
    } else if (model.model === 'http_request') {
      setHttpRequests(updateModelList(model, pushToFront));
    } else if (model.model === 'folder') {
      setFolders(updateModelList(model, pushToFront));
    } else if (model.model === 'http_response') {
      setHttpResponses(updateModelList(model, pushToFront));
    } else if (model.model === 'grpc_request') {
      setGrpcRequests(updateModelList(model, pushToFront));
    } else if (model.model === 'grpc_connection') {
      setGrpcConnections(updateModelList(model, pushToFront));
    } else if (model.model === 'environment') {
      setEnvironments(updateModelList(model, pushToFront));
    } else if (model.model === 'cookie_jar') {
      setCookieJars(updateModelList(model, pushToFront));
    } else if (model.model === 'settings') {
      setSettings(model);
    } else if (queryKey != null) {
      // TODO: Convert all models to use Jotai
      queryClient.setQueryData(queryKey, (current: unknown) => {
        if (model.model === 'key_value') {
          // Special-case for KeyValue
          return extractKeyValue(model);
        }

        if (Array.isArray(current)) {
          return updateModelList(model, pushToFront)(current);
        }
      });
    }
  });

  useListenToTauriEvent<ModelPayload>('deleted_model', ({ payload }) => {
    const { model, windowLabel } = payload;
    if (shouldIgnoreModel(model, windowLabel)) return;

    console.log('Delete model', payload.model);

    if (model.model === 'workspace') {
      setWorkspaces(removeById(model));
    } else if (model.model === 'plugin') {
      setPlugins(removeById(model));
    } else if (model.model === 'http_request') {
      setHttpRequests(removeById(model));
    } else if (model.model === 'http_response') {
      setHttpResponses(removeById(model));
    } else if (model.model === 'folder') {
      setFolders(removeById(model));
    } else if (model.model === 'environment') {
      setEnvironments(removeById(model));
    } else if (model.model === 'grpc_request') {
      setGrpcRequests(removeById(model));
    } else if (model.model === 'grpc_connection') {
      setGrpcConnections(removeById(model));
    } else if (model.model === 'grpc_event') {
      queryClient.setQueryData(grpcEventsQueryKey(model), removeById(model));
    } else if (model.model === 'key_value') {
      queryClient.setQueryData(keyValueQueryKey(model), undefined);
    } else if (model.model === 'cookie_jar') {
      setCookieJars(removeById(model));
    }
  });
}

function updateModelList<T extends AnyModel>(model: T, pushToFront: boolean) {
  return (current: T[]): T[] => {
    const index = current.findIndex((v) => modelsEq(v, model)) ?? -1;
    if (index >= 0) {
      return [...current.slice(0, index), model, ...current.slice(index + 1)];
    } else {
      return pushToFront ? [model, ...(current ?? [])] : [...(current ?? []), model];
    }
  };
}

function removeById<T extends { id: string }>(model: T) {
  return (entries: T[] | undefined) => entries?.filter((e) => e.id !== model.id) ?? [];
}

const shouldIgnoreModel = (payload: AnyModel, windowLabel: string) => {
  if (windowLabel === getCurrentWebviewWindow().label) {
    // Never ignore same-window updates
    return false;
  }
  if (payload.model === 'key_value') {
    return payload.namespace === 'no_sync';
  }
  return false;
};
