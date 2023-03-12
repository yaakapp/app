import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { listen } from '@tauri-apps/api/event';
import { MotionConfig } from 'framer-motion';
import { render } from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppRouter } from './components/AppRouter';
import { requestsQueryKey } from './hooks/useRequest';
import { responsesQueryKey } from './hooks/useResponses';
import { DEFAULT_FONT_SIZE } from './lib/constants';
import type { HttpRequest, HttpResponse } from './lib/models';
import { convertDates } from './lib/models';
import { setAppearance } from './lib/theme/window';
import './main.css';

setAppearance();

// WASM stuff
// await init();
// greet();

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

render(
  <QueryClientProvider client={queryClient}>
    <MotionConfig transition={{ duration: 0.1 }}>
      <HelmetProvider>
        <AppRouter />
      </HelmetProvider>
    </MotionConfig>
  </QueryClientProvider>,
  document.getElementById('root') as HTMLElement,
);
