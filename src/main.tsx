import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import init, { greet } from '@rsw/hello';

import './main.css';

await init();
greet();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <MotionConfig transition={{ duration: 0.15 }}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </MotionConfig>
  </React.StrictMode>,
);
