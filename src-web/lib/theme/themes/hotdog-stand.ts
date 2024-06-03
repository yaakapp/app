import { Color } from '../color';
import type { YaakTheme } from '../window';

export const hotdogStandDefault: YaakTheme = {
  id: 'hotdog-stand',
  name: 'Hotdog Stand',
  background: new Color('#ff0000', 'dark'),
  backgroundHighlight: new Color('#000000', 'dark'),
  backgroundHighlightSecondary: new Color('#000000', 'dark'),
  foreground: new Color('#ffffff', 'dark'),
  foregroundSubtle: new Color('#ffffff', 'dark'),
  foregroundSubtler: new Color('#ffff00', 'dark'),
  colors: {
    primary: new Color('#ffff00', 'dark'),
    secondary: new Color('#ffff00', 'dark'),
    info: new Color('#ffff00', 'dark'),
    notice: new Color('#ffff00', 'dark'),
    warning: new Color('#ffff00', 'dark'),
    danger: new Color('#ffff00', 'dark'),
  },
  components: {
    appHeader: {
      background: new Color('#000000', 'dark'),
      foreground: new Color('#ffffff', 'dark'),
      foregroundSubtle: new Color('#ffff00', 'dark'),
      foregroundSubtler: new Color('#ff0000', 'dark'),
    },
    menu: {
      background: new Color('#000000', 'dark'),
      backgroundHighlight: new Color('#ff0000', 'dark'),
      backgroundHighlightSecondary: new Color('#ff0000', 'dark'),
      foreground: new Color('#ffffff', 'dark'),
      foregroundSubtle: new Color('#ffff00', 'dark'),
      foregroundSubtler: new Color('#ffff00', 'dark'),
    },
    button: {
      background: new Color('#000000', 'dark'),
      foreground: new Color('#ffffff', 'dark'),
      colors: {
        primary: new Color('#000000', 'dark'),
        secondary: new Color('#ffffff', 'dark'),
        info: new Color('#000000', 'dark'),
        notice: new Color('#ffff00', 'dark'),
        warning: new Color('#000000', 'dark'),
        danger: new Color('#ff0000', 'dark'),
      },
    },
    editor: {
      colors: {
        primary: new Color('#ffffff', 'dark'),
        secondary: new Color('#ffffff', 'dark'),
        info: new Color('#ffffff', 'dark'),
        notice: new Color('#ffff00', 'dark'),
        warning: new Color('#ffffff', 'dark'),
        danger: new Color('#ffffff', 'dark'),
      },
    },
  },
};

export const hotdogStand = [hotdogStandDefault];
