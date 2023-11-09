import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { attachConsole } from 'tauri-plugin-log-api';
import { App } from './components/App';
import { getKeyValue } from './lib/keyValueStore';
import { maybeRestorePathname } from './lib/persistPathname';
import { getPreferredAppearance, setAppearance } from './lib/theme/window';
import './main.css';

await attachConsole();
await maybeRestorePathname();

document.addEventListener('keydown', (e) => {
  // Don't go back in history on backspace
  if (e.key === 'Backspace') e.preventDefault();
});

setAppearance(
  await getKeyValue({
    key: 'appearance',
    fallback: getPreferredAppearance(),
  }),
);

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
