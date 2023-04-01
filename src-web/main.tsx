import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import { getKeyValue } from './lib/keyValueStore';
import { syncLastLocation } from './lib/lastLocation';
import { getPreferredAppearance, setAppearance } from './lib/theme/window';
import './main.css';

setAppearance(await getKeyValue({ key: 'appearance', fallback: getPreferredAppearance() }));
await syncLastLocation();

// root holds our app's root DOM Element:
createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
