import { Color } from '../color';
import type { YaakTheme } from '../window';

const draculaDefault: YaakTheme = {
  id: 'dracula',
  name: 'Dracula',
  background: new Color('#282A36', 'dark'),
  backgroundHighlight: new Color('#343746', 'dark'),
  backgroundHighlightSecondary: new Color('#424450', 'dark'),
  foreground: new Color('#F8F8F2', 'dark'),
  foregroundSubtle: new Color('hsl(232,14%,65%)', 'dark'),
  foregroundSubtler: new Color('hsl(232,14%,50%)', 'dark'),
  colors: {
    primary: new Color('#BD93F9', 'dark'),
    secondary: new Color('#6272A4', 'dark'),
    info: new Color('#8BE9FD', 'dark'),
    success: new Color('#50FA7B', 'dark'),
    notice: new Color('#F1FA8C', 'dark'),
    warning: new Color('#FFB86C', 'dark'),
    danger: new Color('#FF5555', 'dark'),
  },
  components: {
    sidebar: {
      background: new Color('hsl(230,15%,24%)', 'dark'),
    },
    appHeader: {
      background: new Color('#21222C', 'dark'),
    },
  },
};

export const dracula = [draculaDefault];
