import { Color } from '../color';
import type { YaakTheme } from '../window';

const catppuccinLatte: YaakTheme = {
  name: 'Catppuccin Latte',
  id: 'catppuccin-light',
  background: new Color('#eff1f5', 'light'),
  foreground: new Color('#4c4f69', 'dark'),
  foregroundSubtle: new Color('#6c6f85', 'light'),
  foregroundSubtler: new Color('#8c8fa1', 'light'),
  colors: {
    primary: new Color('#8839ef', 'light'),
    secondary: new Color('#6c6f85', 'light'),
    info: new Color('#7287fd', 'light'),
    success: new Color('#179299', 'light'),
    notice: new Color('#df8e1d', 'light'),
    warning: new Color('#fe640b', 'light'),
    danger: new Color('#e64553', 'light'),
  },
  components: {
    sidebar: {
      background: new Color('#e6e9ef', 'light'),
      backgroundHighlight: new Color('#e6e9ef', 'light').lift(0.05),
      foregroundSubtler: new Color('#7287fd', 'light'),
    },
    appHeader: {
      background: new Color('#dce0e8', 'light'),
      backgroundHighlight: new Color('#e6e9ef', 'light').lift(0.05),
      foregroundSubtler: new Color('#7287fd', 'light'),
    },
  },
};

const catppuccinMacchiato: YaakTheme = {
  name: 'Catppuccin Macchiato',
  id: 'catppuccin-Macchiato',
  background: new Color('#1e2030', 'dark'),
  foreground: new Color('#cad3f5', 'dark'),
  foregroundSubtle: new Color('#a5adcb', 'dark'),
  foregroundSubtler: new Color('#8087a2', 'dark'),
  colors: {
    primary: new Color('#c6a0f6', 'dark'),
    secondary: new Color('#b8c0e0', 'dark'),
    info: new Color('#8aadf4', 'dark'),
    success: new Color('#a6da95', 'dark'),
    notice: new Color('#eed49f', 'dark'),
    warning: new Color('#f5a97f', 'dark'),
    danger: new Color('#ed8796', 'dark'),
  },
  components: {
    dialog: {
      background: new Color('#181825', 'dark'),
    },
    sidebar: {
      background: new Color('#24273a', 'dark'),
      backgroundHighlight: new Color('#24273a', 'dark').lift(0.05),
    },
    appHeader: {
      background: new Color('#181926', 'dark'),
      backgroundHighlight: new Color('#181926', 'dark').lift(0.1),
    },
    responsePane: {
      background: new Color('#24273a', 'dark'),
      backgroundHighlight: new Color('#24273a', 'dark').lift(0.05),
    },
    button: {
      colors: {
        primary: new Color('#c6a0f6', 'dark').lower(0.1),
        secondary: new Color('#b8c0e0', 'dark').lower(0.1),
        info: new Color('#8aadf4', 'dark').lower(0.1),
        success: new Color('#a6da95', 'dark').lower(0.1),
        notice: new Color('#eed49f', 'dark').lower(0.1),
        warning: new Color('#f5a97f', 'dark').lower(0.1),
        danger: new Color('#ed8796', 'dark').lower(0.1),
      },
    },
  },
};

const catppuccinFrappe: YaakTheme = {
  name: 'Catppuccin Frappé',
  id: 'catppuccin-frappe',
  background: new Color('#292c3c', 'dark'),
  foreground: new Color('#c6d0f5', 'dark'),
  foregroundSubtle: new Color('#a5adce', 'dark'),
  foregroundSubtler: new Color('#838ba7', 'dark'),
  colors: {
    primary: new Color('#ca9ee6', 'dark'),
    secondary: new Color('#b8c0e0', 'dark'),
    info: new Color('#8caaee', 'dark'),
    success: new Color('#a6d189', 'dark'),
    notice: new Color('#e5c890', 'dark'),
    warning: new Color('#ef9f76', 'dark'),
    danger: new Color('#e78284', 'dark'),
  },
  components: {
    dialog: {
      background: new Color('#181825', 'dark'),
    },
    sidebar: {
      background: new Color('#303446', 'dark'),
      backgroundHighlight: new Color('#303446', 'dark').lift(0.05),
    },
    appHeader: {
      background: new Color('#232634', 'dark'),
      backgroundHighlight: new Color('#232634', 'dark').lift(0.1),
    },
    responsePane: {
      background: new Color('#303446', 'dark'),
      backgroundHighlight: new Color('#303446', 'dark').lift(0.05),
    },
    button: {
      colors: {
        primary: new Color('#ca9ee6', 'dark').lower(0.1),
        secondary: new Color('#b8c0e0', 'dark').lower(0.1),
        info: new Color('#8caaee', 'dark').lower(0.1),
        success: new Color('#a6d189', 'dark').lower(0.1),
        notice: new Color('#e5c890', 'dark').lower(0.1),
        warning: new Color('#ef9f76', 'dark').lower(0.1),
        danger: new Color('#e78284', 'dark').lower(0.1),
      },
    },
  },
};

const catppuccinMocha: YaakTheme = {
  name: 'Catppuccin Mocha',
  id: 'catppuccin-mocha',
  background: new Color('#181825', 'dark'),
  foreground: new Color('#cdd6f4', 'dark'),
  foregroundSubtle: new Color('#a6adc8', 'dark'),
  foregroundSubtler: new Color('#7f849c', 'dark'),
  colors: {
    primary: new Color('#c6a0f6', 'dark'),
    secondary: new Color('#bac2de', 'dark'),
    info: new Color('#89b4fa', 'dark'),
    success: new Color('#a6e3a1', 'dark'),
    notice: new Color('#f9e2af', 'dark'),
    warning: new Color('#fab387', 'dark'),
    danger: new Color('#f38ba8', 'dark'),
  },
  components: {
    dialog: {
      background: new Color('#181825', 'dark'),
    },
    sidebar: {
      background: new Color('#1e1e2e', 'dark'),
      backgroundHighlight: new Color('#1e1e2e', 'dark').lift(0.05),
    },
    appHeader: {
      background: new Color('#11111b', 'dark'),
      backgroundHighlight: new Color('#11111b', 'dark').lift(0.1),
    },
    responsePane: {
      background: new Color('#1e1e2e', 'dark'),
      backgroundHighlight: new Color('#1e1e2e', 'dark').lift(0.05),
    },
    button: {
      colors: {
        primary: new Color('#cba6f7', 'dark').lower(0.2).desaturate(0.2),
        secondary: new Color('#bac2de', 'dark').lower(0.2).desaturate(0.2),
        info: new Color('#89b4fa', 'dark').lower(0.2).desaturate(0.2),
        success: new Color('#a6e3a1', 'dark').lower(0.2).desaturate(0.2),
        notice: new Color('#f9e2af', 'dark').lower(0.2).desaturate(0.2),
        warning: new Color('#fab387', 'dark').lower(0.2).desaturate(0.2),
        danger: new Color('#f38ba8', 'dark').lower(0.2).desaturate(0.2),
      },
    },
  },
};

export const catppuccin = [catppuccinFrappe, catppuccinMacchiato, catppuccinMocha, catppuccinLatte];
