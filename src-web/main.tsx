import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {attachConsole} from 'tauri-plugin-log-api';
import {App} from './components/App';
import {maybeRestorePathname} from './lib/persistPathname';
import './main.css';
import {getSettings} from './lib/store';
import type {Appearance} from './lib/theme/window';
import {setAppearanceOnDocument} from './lib/theme/window';
import {appWindow} from "@tauri-apps/api/window";

// Hide decorations here because it doesn't work in Rust for some reason (bug?)
await appWindow.setDecorations(false);

await attachConsole();
await maybeRestorePathname();

const settings = await getSettings();
setAppearanceOnDocument(settings.appearance as Appearance);

document.addEventListener('keydown', (e) => {
    // Don't go back in history on backspace
    if (e.key === 'Backspace') e.preventDefault();
});

createRoot(document.getElementById('root') as HTMLElement).render(
    <StrictMode>
        <App/>
    </StrictMode>,
);
