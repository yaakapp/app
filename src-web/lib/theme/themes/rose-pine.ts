import { Color } from '../color';
import type { YaakTheme } from '../window';

const rosePineClassic: YaakTheme = {
  id: 'rose-pine',
  name: 'Rosé Pine',
  background: new Color('#191724', 'dark'),
  foreground: new Color('#e0def4', 'dark'),
  foregroundSubtle: new Color('#908caa', 'dark'),
  foregroundSubtler: new Color('#6e6a86', 'dark'),
  colors: {
    primary: new Color('#c4a7e7', 'dark'),
    secondary: new Color('#6e6a86', 'dark'),
    info: new Color('#67abcb', 'dark'),
    success: new Color('#9cd8d8', 'dark'),
    notice: new Color('#f6c177', 'dark'),
    warning: new Color('#f1a3a1', 'dark'),
    danger: new Color('#eb6f92', 'dark'),
  },
  components: {
    responsePane: {
      background: new Color('#1f1d2e', 'dark'),
    },
    sidebar: {
      background: new Color('#1f1d2e', 'dark'),
    },
    menu: {
      background: new Color('#393552', 'dark'),
      foregroundSubtle: new Color('#908caa', 'dark').lift(0.15),
      foregroundSubtler: new Color('#6e6a86', 'dark').lift(0.15),
    },
  },
};

const rosePineMoon: YaakTheme = {
  id: 'rose-pine-moon',
  name: 'Rosé Pine Moon',
  background: new Color('#232136', 'dark'),
  foreground: new Color('#e0def4', 'dark'),
  foregroundSubtle: new Color('#908caa', 'dark'),
  foregroundSubtler: new Color('#6e6a86', 'dark'),
  colors: {
    primary: new Color('#c4a7e7', 'dark'),
    secondary: new Color('#908caa', 'dark'),
    info: new Color('#68aeca', 'dark'),
    success: new Color('#9ccfd8', 'dark'),
    notice: new Color('#f6c177', 'dark'),
    warning: new Color('#ea9a97', 'dark'),
    danger: new Color('#eb6f92', 'dark'),
  },
  components: {
    responsePane: {
      background: new Color('#2a273f', 'dark'),
    },
    sidebar: {
      background: new Color('#2a273f', 'dark'),
    },
    menu: {
      background: new Color('#393552', 'dark'),
      foregroundSubtle: new Color('#908caa', 'dark').lift(0.15),
      foregroundSubtler: new Color('#6e6a86', 'dark').lift(0.15),
    },
  },
};

const rosePineDawn: YaakTheme = {
  id: 'rose-pine-dawn',
  name: 'Rosé Pine Dawn',
  background: new Color('#faf4ed', 'light'),
  backgroundHighlight: new Color('#dfdad9', 'light'),
  backgroundHighlightSecondary: new Color('#f4ede8', 'light'),
  foreground: new Color('#575279', 'light'),
  foregroundSubtle: new Color('#797593', 'light'),
  foregroundSubtler: new Color('#9893a5', 'light'),
  colors: {
    primary: new Color('#9070ad', 'light'),
    secondary: new Color('#6e6a86', 'light'),
    info: new Color('#2d728d', 'light'),
    success: new Color('#4f8c96', 'light'),
    notice: new Color('#cb862d', 'light'),
    warning: new Color('#ce7b78', 'light'),
    danger: new Color('#b4637a', 'light'),
  },
  components: {
    responsePane: {
      backgroundHighlight: new Color('#e8e4e2', 'light'),
    },
    sidebar: {
      backgroundHighlight: new Color('#e8e4e2', 'light'),
    },
    appHeader: {
      backgroundHighlight: new Color('#e8e4e2', 'light'),
    },
    input: {
      backgroundHighlight: new Color('#dfdad9', 'light'),
    },
    dialog: {
      backgroundHighlight: new Color('#e8e4e2', 'light'),
    },
    menu: {
      background: new Color('#f2e9e1', 'light'),
      backgroundHighlight: new Color('#dfdad9', 'light'),
      backgroundHighlightSecondary: new Color('#6e6a86', 'light'),
    },
  },
};

export const rosePine = [rosePineClassic, rosePineDawn, rosePineMoon];
