import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import { getKeyValue } from './lib/keyValueStore';
import { getPreferredAppearance, setAppearance } from './lib/theme/window';
import './main.css';

setAppearance(await getKeyValue({ key: 'appearance', fallback: getPreferredAppearance() }));

// root holds our app's root DOM Element:
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
