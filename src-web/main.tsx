import { render } from 'preact';
import { App } from './App';
import { setAppearance } from './lib/theme/window';
import './main.css';

setAppearance();

// root holds our app's root DOM Element:
render(<App />, document.getElementById('root') as HTMLElement);
