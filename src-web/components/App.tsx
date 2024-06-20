import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MotionConfig } from 'framer-motion';
import React, { Suspense } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { HelmetProvider } from 'react-helmet-async';
import { AppRouter } from './AppRouter';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: true,
      networkMode: 'offlineFirst',
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <MotionConfig transition={{ duration: 0.1 }}>
        <HelmetProvider>
          <DndProvider backend={HTML5Backend}>
            <Suspense>
              <AppRouter />
            </Suspense>
          </DndProvider>
        </HelmetProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
