import { invoke } from '@tauri-apps/api';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import type { KeyValue } from './lib/models';
import type { Appearance } from './lib/theme/window';
import { getPreferredAppearance, setAppearance } from './lib/theme/window';
import './main.css';

const appearance: KeyValue = await invoke('get_key_value', {
  namespace: 'app',
  key: 'appearance',
});
setAppearance((appearance?.value ?? getPreferredAppearance()) as Appearance);

// root holds our app's root DOM Element:
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
