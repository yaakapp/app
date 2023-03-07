import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { listen } from '@tauri-apps/api/event';
import { MotionConfig } from 'framer-motion';
import init, { greet } from 'hello';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import { Layout } from './components/Layout';
import { RouterError } from './components/RouterError';
import { requestsQueryKey } from './hooks/useRequest';
import { responsesQueryKey } from './hooks/useResponses';
import type { HttpRequest, HttpResponse } from './lib/models';
import { convertDates } from './lib/models';
import { setAppearance } from './lib/theme/window';
import './main.css';
import { Workspaces } from './pages/Workspaces';

setAppearance();

// WASM stuff
await init();
greet();

const queryClient = new QueryClient();

await listen('updated_request', ({ payload: request }: { payload: HttpRequest }) => {
  queryClient.setQueryData(
    requestsQueryKey(request.workspaceId),
    (requests: HttpRequest[] = []) => {
      const newRequests = [];
      let found = false;
      for (const r of requests) {
        if (r.id === request.id) {
          found = true;
          newRequests.push(convertDates(request));
        } else {
          newRequests.push(r);
        }
      }
      if (!found) {
        newRequests.push(convertDates(request));
      }
      return newRequests;
    },
  );
});

await listen('deleted_request', ({ payload: request }: { payload: HttpRequest }) => {
  queryClient.setQueryData(requestsQueryKey(request.workspaceId), (requests: HttpRequest[] = []) =>
    requests.filter((r) => r.id !== request.id),
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
          newResponses.push(convertDates(response));
        } else {
          newResponses.push(r);
        }
      }
      if (!found) {
        newResponses.push(convertDates(response));
      }
      return newResponses;
    },
  );
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <RouterError />,
    children: [
      {
        path: '/',
        element: <Workspaces />,
      },
      {
        path: '/workspaces/:workspaceId',
        element: <App />,
      },
      {
        path: '/workspaces/:workspaceId/requests/:requestId',
        element: <App />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MotionConfig transition={{ duration: 0.1 }}>
        <HelmetProvider>
          <RouterProvider router={router} />
        </HelmetProvider>
      </MotionConfig>
    </QueryClientProvider>
  </React.StrictMode>,
);
