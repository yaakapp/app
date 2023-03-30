console.log('FIRST 0');
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import { getKeyValue } from './lib/keyValueStore';
import { getPreferredAppearance, setAppearance } from './lib/theme/window';
import './main.css';

console.log('FIRST');
setAppearance(await getKeyValue({ key: 'appearance', fallback: getPreferredAppearance() }));
console.log('SECOND');

// root holds our app's root DOM Element:
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
