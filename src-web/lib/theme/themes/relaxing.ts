import { Color } from '../color';
import type { YaakTheme } from '../window';

const relaxingDefault: YaakTheme = {
  name: 'Relaxing',
  id: 'relaxing',
  background: new Color('#2b1e3b', 'dark'),
  foreground: new Color('#ede2f5', 'dark'),
  colors: {
    primary: new Color('#cba6f7', 'dark'),
    secondary: new Color('#bac2de', 'dark'),
    info: new Color('#89b4fa', 'dark'),
    success: new Color('#a6e3a1', 'dark'),
    notice: new Color('#f9e2af', 'dark'),
    warning: new Color('#fab387', 'dark'),
    danger: new Color('#f38ba8', 'dark'),
  },
};

export const relaxing = [relaxingDefault];
