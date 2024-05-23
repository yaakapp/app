import { Color } from '../color';
import type { YaakTheme } from '../window';

export const yaakLight: YaakTheme = {
  id: 'yaak-light',
  name: 'Yaak',
  background: new Color('hsl(216,24%,100%)', 'light'),
  backgroundHighlight: new Color('hsl(216,24%,93%)', 'light'),
  backgroundHighlightSecondary: new Color('hsl(216,24%,87%)', 'light'),
  foreground: new Color('hsl(219,23%,15%)', 'light'),
  foregroundSubtle: new Color('hsl(219,23%,15%)', 'light').lower(0.3),
  foregroundSubtler: new Color('hsl(219,23%,15%)', 'light').lower(0.5),
  colors: {
    primary: new Color('hsl(266,100%,70%)', 'light'),
    secondary: new Color('hsl(220,24%,59%)', 'light'),
    info: new Color('hsl(206,100%,48%)', 'light'),
    success: new Color('hsl(155,95%,33%)', 'light'),
    notice: new Color('hsl(45,100%,41%)', 'light'),
    warning: new Color('hsl(30,100%,43%)', 'light'),
    danger: new Color('hsl(335,75%,57%)', 'light'),
  },
  components: {
    sidebar: {
      background: new Color('hsl(216,24%,97%)', 'light'),
      backgroundHighlight: new Color('hsl(216,24%,93%)', 'light'),
      backgroundHighlightSecondary: new Color('hsl(216,24%,90%)', 'light'),
    },
  },
};

export const yaakDark: YaakTheme = {
  id: 'yaak-dark',
  name: 'Yaak',
  background: new Color('hsl(244,23%,13%)', 'dark'),
  backgroundHighlight: new Color('hsl(244,23%,23%)', 'dark'),
  backgroundHighlightSecondary: new Color('hsl(244,23%,20%)', 'dark'),
  foreground: new Color('hsl(245,23%,86%)', 'dark'),
  foregroundSubtle: new Color('hsl(245,20%,65%)', 'dark'),
  foregroundSubtler: new Color('hsl(245,18%,50%)', 'dark'),

  colors: {
    primary: new Color('hsl(266,100%,79%)', 'dark'),
    secondary: new Color('hsl(245,23%,60%)', 'dark'),
    info: new Color('hsl(206,100%,63%)', 'dark'),
    success: new Color('hsl(150,99%,44%)', 'dark'),
    notice: new Color('hsl(48,80%,63%)', 'dark'),
    warning: new Color('hsl(28,100%,61%)', 'dark'),
    danger: new Color('hsl(342,90%,68%)', 'dark'),
  },

  components: {
    button: {
      colors: {
        primary: new Color('hsl(266,100%,79%)', 'dark').lower(0.1),
        secondary: new Color('hsl(245,23%,60%)', 'dark').lower(0.1),
        info: new Color('hsl(206,100%,63%)', 'dark').lower(0.1),
        success: new Color('hsl(150,99%,44%)', 'dark').lower(0.1),
        notice: new Color('hsl(48,80%,63%)', 'dark').lower(0.1),
        warning: new Color('hsl(28,100%,61%)', 'dark').lower(0.1),
        danger: new Color('hsl(342,90%,68%)', 'dark').lower(0.1),
      },
    },
    input: {
      backgroundHighlight: new Color('hsl(244,23%,24%)', 'dark'),
    },
    dialog: {
      backgroundHighlight: new Color('hsl(244,23%,24%)', 'dark'),
    },
    sidebar: {
      background: new Color('hsl(243,23%,16%)', 'dark'),
      backgroundHighlight: new Color('hsl(244,23%,22%)', 'dark'),
    },
    responsePane: {
      background: new Color('hsl(243,23%,16%)', 'dark'),
      backgroundHighlight: new Color('hsl(244,23%,16%)', 'dark').lift(0.08),
    },
    appHeader: {
      background: new Color('hsl(244,23%,12%)', 'dark'),
      backgroundHighlight: new Color('hsl(244,23%,12%)', 'dark').lift(0.1),
    },
  },
};

export const yaak = [yaakDark, yaakLight];
