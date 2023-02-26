import React from 'react';
import init, { greet } from 'hello';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import { invoke } from '@tauri-apps/api';
import { setTheme } from './lib/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Workspaces } from './pages/Workspaces';
import './main.css';

setTheme();

await init();
greet();
await invoke('load_db');
const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
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
      <MotionConfig transition={{ duration: 0.15 }}>
        <HelmetProvider>
          <RouterProvider router={router} />
        </HelmetProvider>
      </MotionConfig>
    </QueryClientProvider>
  </React.StrictMode>,
);
