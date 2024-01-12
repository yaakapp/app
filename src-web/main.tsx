import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { attachConsole } from 'tauri-plugin-log-api';
import { App } from './components/App';
import { maybeRestorePathname } from './lib/persistPathname';
import './main.css';

await attachConsole();
await maybeRestorePathname();

document.addEventListener('keydown', (e) => {
  // Don't go back in history on backspace
  if (e.key === 'Backspace') e.preventDefault();
});

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
