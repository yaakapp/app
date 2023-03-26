import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { MotionConfig } from 'framer-motion';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { HelmetProvider } from 'react-helmet-async';
import { matchPath } from 'react-router-dom';
import { keyValueQueryKey } from '../hooks/useKeyValue';
import { requestsQueryKey } from '../hooks/useRequests';
import { responsesQueryKey } from '../hooks/useResponses';
import { routePaths } from '../hooks/useRoutes';
import type { SidebarDisplay } from '../hooks/useSidebarDisplay';
import { sidebarDisplayDefaultValue, sidebarDisplayKey } from '../hooks/useSidebarDisplay';
import { workspacesQueryKey } from '../hooks/useWorkspaces';
import { DEFAULT_FONT_SIZE } from '../lib/constants';
import { extractKeyValue, getKeyValue, setKeyValue } from '../lib/keyValueStore';
import type { HttpRequest, HttpResponse, KeyValue, Workspace } from '../lib/models';
import { AppRouter } from './AppRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      networkMode: 'offlineFirst',
    },
  },
});

const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  throttleTime: 1000,
});

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
  maxAge: 1000 * 60 * 60 * 24, // 24 hours
});

await listen('updated_key_value', ({ payload: keyValue }: { payload: KeyValue }) => {
  queryClient.setQueryData(keyValueQueryKey(keyValue), extractKeyValue(keyValue));
});

await listen('updated_request', ({ payload: request }: { payload: HttpRequest }) => {
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
      return newRequests;
    },
  );
});

await listen('updated_response', ({ payload: response }: { payload: HttpResponse }) => {
  queryClient.setQueryData(
    responsesQueryKey(response.requestId),
    (responses: HttpResponse[] = []) => {
      const newResponses = [];
      let found = false;
      for (const r of responses) {
        if (r.id === response.id) {
          found = true;
          newResponses.push(response);
        } else {
          newResponses.push(r);
        }
      }
      if (!found) {
        newResponses.push(response);
      }
      return newResponses;
    },
  );
});

await listen('updated_workspace', ({ payload: workspace }: { payload: Workspace }) => {
  queryClient.setQueryData(workspacesQueryKey(), (workspaces: Workspace[] = []) => {
    const newWorkspaces = [];
    let found = false;
    for (const w of workspaces) {
      if (w.id === workspace.id) {
        found = true;
        newWorkspaces.push(workspace);
      } else {
        newWorkspaces.push(w);
      }
    }
    if (!found) {
      newWorkspaces.push(workspace);
    }
    return newWorkspaces;
  });
});

await listen(
  'deleted_model',
  ({ payload: model }: { payload: Workspace | HttpRequest | HttpResponse | KeyValue }) => {
    function removeById<T extends { id: string }>(model: T) {
      return (entries: T[] | undefined) => entries?.filter((e) => e.id !== model.id);
    }

    if (model.model === 'workspace') {
      queryClient.setQueryData(workspacesQueryKey(), removeById<Workspace>(model));
    } else if (model.model === 'http_request') {
      queryClient.setQueryData(requestsQueryKey(model.workspaceId), removeById<HttpRequest>(model));
    } else if (model.model === 'http_response') {
      queryClient.setQueryData(responsesQueryKey(model.requestId), removeById<HttpResponse>(model));
    } else if (model.model === 'key_value') {
      queryClient.setQueryData(keyValueQueryKey(model), undefined);
    }
  },
);

await listen('send_request', async () => {
  const params = matchPath(routePaths.request(), window.location.pathname);
  const requestId = params?.params.requestId;
  if (typeof requestId !== 'string') {
    return;
  }
  await invoke('send_request', { requestId });
});

await listen('refresh', () => {
  location.reload();
});

await listen('toggle_sidebar', async () => {
  const display = await getKeyValue<SidebarDisplay>({
    key: sidebarDisplayKey,
    fallback: sidebarDisplayDefaultValue,
  });
  await setKeyValue({
    key: sidebarDisplayKey,
    value: { width: display.width, hidden: !display.hidden },
  });
});

await listen('zoom', ({ payload: zoomDelta }: { payload: number }) => {
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

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig transition={{ duration: 0.1 }}>
        <HelmetProvider>
          <DndProvider backend={HTML5Backend}>
            <AppRouter />
            <ReactQueryDevtools initialIsOpen={false} />
          </DndProvider>
        </HelmetProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
