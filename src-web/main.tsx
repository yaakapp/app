import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import init, { greet } from 'hello';
import { invoke } from '@tauri-apps/api';
import { setTheme } from './lib/theme';

import './main.css';
import { QueryClient, QueryClientProvider } from 'react-query';

setTheme();

await init();
greet();
await invoke('load_db');

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <MotionConfig transition={{ duration: 0.15 }}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </MotionConfig>
    </QueryClientProvider>
  </React.StrictMode>,
);
