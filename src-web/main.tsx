import { type } from '@tauri-apps/api/os';
import { appWindow } from '@tauri-apps/api/window';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import './main.css';
import { getSettings } from './lib/store';
import type { Appearance } from './lib/theme/window';
import { setAppearanceOnDocument } from './lib/theme/window';

// Hide decorations here because it doesn't work in Rust for some reason (bug?)
const osType = await type();
if (osType !== 'Darwin') {
  await appWindow.setDecorations(false);
}

// await attachConsole();
// await maybeRestorePathname();

const settings = await getSettings();
setAppearanceOnDocument(settings.appearance as Appearance);

window.addEventListener('keypress', (e) => {
  // Don't go back in history on backspace
  if (e.key === 'Backspace') e.preventDefault();
});

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
