import { YaakColor } from '../yaakColor';
import type { YaakTheme } from '../window';

export const catppuccinLatte: YaakTheme = {
  name: 'Catppuccin Latte',
  id: 'catppuccin-latte',
  surface: new YaakColor('#eff1f5', 'light'),
  text: new YaakColor('#4c4f69', 'dark'),
  textSubtle: new YaakColor('#6c6f85', 'light'),
  textSubtlest: new YaakColor('#8c8fa1', 'light'),
  primary: new YaakColor('#8839ef', 'light'),
  secondary: new YaakColor('#6c6f85', 'light'),
  info: new YaakColor('#7287fd', 'light'),
  success: new YaakColor('#179299', 'light'),
  notice: new YaakColor('#df8e1d', 'light'),
  warning: new YaakColor('#fe640b', 'light'),
  danger: new YaakColor('#e64553', 'light'),
  components: {
    sidebar: {
      surface: new YaakColor('#e6e9ef', 'light'),
      border: new YaakColor('#e6e9ef', 'light').lift(0.05),
    },
    appHeader: {
      surface: new YaakColor('#dce0e8', 'light'),
      border: new YaakColor('#e6e9ef', 'light').lift(0.05),
    },
  },
};

export const catppuccinMacchiato: YaakTheme = {
  name: 'Catppuccin Macchiato',
  id: 'catppuccin-macchiato',
  surface: new YaakColor('#1e2030', 'dark'),
  text: new YaakColor('#cad3f5', 'dark'),
  textSubtle: new YaakColor('#a5adcb', 'dark'),
  textSubtlest: new YaakColor('#8087a2', 'dark'),
  primary: new YaakColor('#c6a0f6', 'dark'),
  secondary: new YaakColor('#b8c0e0', 'dark'),
  info: new YaakColor('#8aadf4', 'dark'),
  success: new YaakColor('#a6da95', 'dark'),
  notice: new YaakColor('#eed49f', 'dark'),
  warning: new YaakColor('#f5a97f', 'dark'),
  danger: new YaakColor('#ed8796', 'dark'),
  components: {
    dialog: {
      surface: new YaakColor('#181825', 'dark'),
    },
    sidebar: {
      surface: new YaakColor('#24273a', 'dark'),
      border: new YaakColor('#24273a', 'dark').lift(0.05),
    },
    appHeader: {
      surface: new YaakColor('#181926', 'dark'),
      border: new YaakColor('#181926', 'dark').lift(0.1),
    },
    responsePane: {
      surface: new YaakColor('#24273a', 'dark'),
      border: new YaakColor('#24273a', 'dark').lift(0.05),
    },
    button: {
      primary: new YaakColor('#c6a0f6', 'dark').lower(0.1),
      secondary: new YaakColor('#b8c0e0', 'dark').lower(0.1),
      info: new YaakColor('#8aadf4', 'dark').lower(0.1),
      success: new YaakColor('#a6da95', 'dark').lower(0.1),
      notice: new YaakColor('#eed49f', 'dark').lower(0.1),
      warning: new YaakColor('#f5a97f', 'dark').lower(0.1),
      danger: new YaakColor('#ed8796', 'dark').lower(0.1),
    },
  },
};

export const catppuccinFrappe: YaakTheme = {
  name: 'Catppuccin Frappé',
  id: 'catppuccin-frappe',
  surface: new YaakColor('#292c3c', 'dark'),
  text: new YaakColor('#c6d0f5', 'dark'),
  textSubtle: new YaakColor('#a5adce', 'dark'),
  textSubtlest: new YaakColor('#838ba7', 'dark'),
  primary: new YaakColor('#ca9ee6', 'dark'),
  secondary: new YaakColor('#b8c0e0', 'dark'),
  info: new YaakColor('#8caaee', 'dark'),
  success: new YaakColor('#a6d189', 'dark'),
  notice: new YaakColor('#e5c890', 'dark'),
  warning: new YaakColor('#ef9f76', 'dark'),
  danger: new YaakColor('#e78284', 'dark'),
  components: {
    dialog: {
      surface: new YaakColor('#181825', 'dark'),
    },
    sidebar: {
      surface: new YaakColor('#303446', 'dark'),
      border: new YaakColor('#303446', 'dark').lift(0.05),
    },
    appHeader: {
      surface: new YaakColor('#232634', 'dark'),
      border: new YaakColor('#232634', 'dark').lift(0.1),
    },
    responsePane: {
      surface: new YaakColor('#303446', 'dark'),
      border: new YaakColor('#303446', 'dark').lift(0.05),
    },
    button: {
      primary: new YaakColor('#ca9ee6', 'dark').lower(0.1),
      secondary: new YaakColor('#b8c0e0', 'dark').lower(0.1),
      info: new YaakColor('#8caaee', 'dark').lower(0.1),
      success: new YaakColor('#a6d189', 'dark').lower(0.1),
      notice: new YaakColor('#e5c890', 'dark').lower(0.1),
      warning: new YaakColor('#ef9f76', 'dark').lower(0.1),
      danger: new YaakColor('#e78284', 'dark').lower(0.1),
    },
  },
};

const catppuccinMocha: YaakTheme = {
  name: 'Catppuccin Mocha',
  id: 'catppuccin-mocha',
  surface: new YaakColor('#181825', 'dark'),
  text: new YaakColor('#cdd6f4', 'dark'),
  textSubtle: new YaakColor('#a6adc8', 'dark'),
  textSubtlest: new YaakColor('#7f849c', 'dark'),
  primary: new YaakColor('#c6a0f6', 'dark'),
  secondary: new YaakColor('#bac2de', 'dark'),
  info: new YaakColor('#89b4fa', 'dark'),
  success: new YaakColor('#a6e3a1', 'dark'),
  notice: new YaakColor('#f9e2af', 'dark'),
  warning: new YaakColor('#fab387', 'dark'),
  danger: new YaakColor('#f38ba8', 'dark'),
  components: {
    dialog: {
      surface: new YaakColor('#181825', 'dark'),
    },
    sidebar: {
      surface: new YaakColor('#1e1e2e', 'dark'),
      border: new YaakColor('#1e1e2e', 'dark').lift(0.05),
    },
    appHeader: {
      surface: new YaakColor('#11111b', 'dark'),
      border: new YaakColor('#11111b', 'dark').lift(0.1),
    },
    responsePane: {
      surface: new YaakColor('#1e1e2e', 'dark'),
      border: new YaakColor('#1e1e2e', 'dark').lift(0.05),
    },
    button: {
      primary: new YaakColor('#cba6f7', 'dark').lower(0.2).desaturate(0.2),
      secondary: new YaakColor('#bac2de', 'dark').lower(0.2).desaturate(0.2),
      info: new YaakColor('#89b4fa', 'dark').lower(0.2).desaturate(0.2),
      success: new YaakColor('#a6e3a1', 'dark').lower(0.2).desaturate(0.2),
      notice: new YaakColor('#f9e2af', 'dark').lower(0.2).desaturate(0.2),
      warning: new YaakColor('#fab387', 'dark').lower(0.2).desaturate(0.2),
      danger: new YaakColor('#f38ba8', 'dark').lower(0.2).desaturate(0.2),
    },
  },
};

export const catppuccin = [catppuccinFrappe, catppuccinMacchiato, catppuccinMocha, catppuccinLatte];
