import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MotionConfig } from 'framer-motion';
import { Suspense } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { HelmetProvider } from 'react-helmet-async';
import { AppRouter } from './AppRouter';
import { DialogProvider } from './DialogContext';
import { TauriListeners } from './TauriListeners';

const queryClient = new QueryClient({
  logger: undefined,
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
      <MotionConfig transition={{ duration: 0.1 }}>
        <HelmetProvider>
          <DndProvider backend={HTML5Backend}>
            <DialogProvider>
              <Suspense>
                <AppRouter />
                <TauriListeners />
                {/*<ReactQueryDevtools initialIsOpen={false} />*/}
              </Suspense>
            </DialogProvider>
          </DndProvider>
        </HelmetProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
