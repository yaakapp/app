import { useQueryClient } from '@tanstack/react-query';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { Model } from '@yaakapp/api';
import { useEffect } from 'react';
import { useEnsureActiveCookieJar, useMigrateActiveCookieJarId } from '../hooks/useActiveCookieJar';
import { useActiveWorkspaceChangedToast } from '../hooks/useActiveWorkspaceChangedToast';
import { cookieJarsQueryKey } from '../hooks/useCookieJars';
import { useCopy } from '../hooks/useCopy';
import { environmentsQueryKey } from '../hooks/useEnvironments';
import { foldersQueryKey } from '../hooks/useFolders';
import { grpcConnectionsQueryKey } from '../hooks/useGrpcConnections';
import { grpcEventsQueryKey } from '../hooks/useGrpcEvents';
import { grpcRequestsQueryKey } from '../hooks/useGrpcRequests';
import { useHotKey } from '../hooks/useHotKey';
import { httpRequestsQueryKey } from '../hooks/useHttpRequests';
import { httpResponsesQueryKey } from '../hooks/useHttpResponses';
import { keyValueQueryKey } from '../hooks/useKeyValue';
import { useListenToTauriEvent } from '../hooks/useListenToTauriEvent';
import { useNotificationToast } from '../hooks/useNotificationToast';
import { useRecentCookieJars } from '../hooks/useRecentCookieJars';
import { useRecentEnvironments } from '../hooks/useRecentEnvironments';
import { useRecentRequests } from '../hooks/useRecentRequests';
import { useRecentWorkspaces } from '../hooks/useRecentWorkspaces';
import { useRequestUpdateKey } from '../hooks/useRequestUpdateKey';
import { settingsQueryKey, useSettings } from '../hooks/useSettings';
import { useSyncThemeToDocument } from '../hooks/useSyncThemeToDocument';
import { useToggleCommandPalette } from '../hooks/useToggleCommandPalette';
import { workspacesQueryKey } from '../hooks/useWorkspaces';
import { useZoom } from '../hooks/useZoom';
import { extractKeyValue } from '../lib/keyValueStore';
import { modelsEq } from '../lib/models';
import { catppuccinMacchiato } from '../lib/theme/themes/catppuccin';
import { githubLight } from '../lib/theme/themes/github';
import { hotdogStandDefault } from '../lib/theme/themes/hotdog-stand';
import { monokaiProDefault } from '../lib/theme/themes/monokai-pro';
import { rosePineDefault } from '../lib/theme/themes/rose-pine';
import { yaakDark } from '../lib/theme/themes/yaak';
import { getThemeCSS } from '../lib/theme/window';

export function GlobalHooks() {
  // Include here so they always update, even if no component references them
  useRecentWorkspaces();
  useRecentEnvironments();
  useRecentCookieJars();
  useRecentRequests();

  // Other useful things
  useSyncThemeToDocument();
  useNotificationToast();
  useActiveWorkspaceChangedToast();
  useEnsureActiveCookieJar();

  // TODO: Remove in future version
  useMigrateActiveCookieJarId();

  const toggleCommandPalette = useToggleCommandPalette();
  useHotKey('command_palette.toggle', toggleCommandPalette);

  const queryClient = useQueryClient();
  const { wasUpdatedExternally } = useRequestUpdateKey(null);

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
        : model.model === 'environment'
        ? environmentsQueryKey(model)
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

    if (model.model === 'http_request' && windowLabel !== getCurrentWebviewWindow().label) {
      wasUpdatedExternally(model.id);
    }

    const pushToFront = (['http_response', 'grpc_connection'] as Model['model'][]).includes(
      model.model,
    );

    if (shouldIgnoreModel(model, windowLabel)) return;

    queryClient.setQueryData(queryKey, (current: unknown) => {
      if (model.model === 'key_value') {
        // Special-case for KeyValue
        return extractKeyValue(model);
      }

      if (Array.isArray(current)) {
        const index = current.findIndex((v) => modelsEq(v, model)) ?? -1;
        if (index >= 0) {
          return [...current.slice(0, index), model, ...current.slice(index + 1)];
        } else {
          return pushToFront ? [model, ...(current ?? [])] : [...(current ?? []), model];
        }
      }
    });
  });

  useListenToTauriEvent<ModelPayload>('deleted_model', ({ payload }) => {
    const { model, windowLabel } = payload;
    if (shouldIgnoreModel(model, windowLabel)) return;

    if (model.model === 'workspace') {
      queryClient.setQueryData(workspacesQueryKey(), removeById(model));
    } else if (model.model === 'http_request') {
      queryClient.setQueryData(httpRequestsQueryKey(model), removeById(model));
    } else if (model.model === 'http_response') {
      queryClient.setQueryData(httpResponsesQueryKey(model), removeById(model));
    } else if (model.model === 'folder') {
      queryClient.setQueryData(foldersQueryKey(model), removeById(model));
    } else if (model.model === 'environment') {
      queryClient.setQueryData(environmentsQueryKey(model), removeById(model));
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

  const settings = useSettings();
  useEffect(() => {
    if (settings == null) {
      return;
    }

    const { interfaceScale, interfaceFontSize, editorFontSize } = settings;
    getCurrentWebviewWindow().setZoom(interfaceScale).catch(console.error);
    document.documentElement.style.setProperty('font-size', `${interfaceFontSize}px`);
    document.documentElement.style.setProperty('--editor-font-size', `${editorFontSize}px`);
  }, [settings]);

  // Handle Zoom. Note, Mac handles it in app menu, so need to also handle keyboard
  // shortcuts for Windows/Linux
  const zoom = useZoom();
  useHotKey('app.zoom_in', () => zoom.zoomIn);
  useListenToTauriEvent('zoom_in', () => zoom.zoomIn);
  useHotKey('app.zoom_out', () => zoom.zoomOut);
  useListenToTauriEvent('zoom_out', () => zoom.zoomOut);
  useHotKey('app.zoom_reset', () => zoom.zoomReset);
  useListenToTauriEvent('zoom_reset', () => zoom.zoomReset);

  const copy = useCopy();
  useListenToTauriEvent('generate_theme_css', () => {
    const themesCss = [
      yaakDark,
      monokaiProDefault,
      rosePineDefault,
      catppuccinMacchiato,
      githubLight,
      hotdogStandDefault,
    ]
      .map(getThemeCSS)
      .join('\n\n');
    copy(themesCss);
  });

  return null;
}

function removeById<T extends { id: string }>(model: T) {
  return (entries: T[] | undefined) => entries?.filter((e) => e.id !== model.id);
}

const shouldIgnoreModel = (payload: Model, windowLabel: string) => {
  if (windowLabel === getCurrentWebviewWindow().label) {
    // Never ignore same-window updates
    return false;
  }
  if (payload.model === 'key_value') {
    return payload.namespace === 'no_sync';
  }
  return false;
};
