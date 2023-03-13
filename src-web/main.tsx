import ReactDOM from 'react-dom/client';
import { App } from './App';
import { setAppearance } from './lib/theme/window';
import './main.css';

setAppearance();

// root holds our app's root DOM Element:
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);
