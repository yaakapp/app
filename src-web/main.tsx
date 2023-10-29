import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import { getKeyValue } from './lib/keyValueStore';
import { getPreferredAppearance, setAppearance } from './lib/theme/window';
import './main.css';
import { initPathnamePersistance } from './lib/initPathnamePersistance';

await initPathnamePersistance();

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
