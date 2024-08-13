import { YaakColor } from '../yaakColor';
import type { YaakTheme } from '../window';

export const rosePineDefault: YaakTheme = {
  id: 'rose-pine',
  name: 'Rosé Pine',
  surface: new YaakColor('#191724', 'dark'),
  text: new YaakColor('#e0def4', 'dark'),
  textSubtle: new YaakColor('#908caa', 'dark'),
  textSubtlest: new YaakColor('#6e6a86', 'dark'),
  primary: new YaakColor('#c4a7e7', 'dark'),
  secondary: new YaakColor('#6e6a86', 'dark'),
  info: new YaakColor('#67abcb', 'dark'),
  success: new YaakColor('#9cd8d8', 'dark'),
  notice: new YaakColor('#f6c177', 'dark'),
  warning: new YaakColor('#f1a3a1', 'dark'),
  danger: new YaakColor('#eb6f92', 'dark'),
  components: {
    responsePane: {
      surface: new YaakColor('#1f1d2e', 'dark'),
    },
    sidebar: {
      surface: new YaakColor('#1f1d2e', 'dark'),
    },
    menu: {
      surface: new YaakColor('#393552', 'dark'),
      textSubtle: new YaakColor('#908caa', 'dark').lift(0.15),
      textSubtlest: new YaakColor('#6e6a86', 'dark').lift(0.15),
      border: new YaakColor('#393552', 'dark').lift(0.2),
      borderSubtle: new YaakColor('#393552', 'dark').lift(0.12),
    },
  },
};

const rosePineMoon: YaakTheme = {
  id: 'rose-pine-moon',
  name: 'Rosé Pine Moon',
  surface: new YaakColor('#232136', 'dark'),
  text: new YaakColor('#e0def4', 'dark'),
  textSubtle: new YaakColor('#908caa', 'dark'),
  textSubtlest: new YaakColor('#6e6a86', 'dark'),
  primary: new YaakColor('#c4a7e7', 'dark'),
  secondary: new YaakColor('#908caa', 'dark'),
  info: new YaakColor('#68aeca', 'dark'),
  success: new YaakColor('#9ccfd8', 'dark'),
  notice: new YaakColor('#f6c177', 'dark'),
  warning: new YaakColor('#ea9a97', 'dark'),
  danger: new YaakColor('#eb6f92', 'dark'),
  components: {
    responsePane: {
      surface: new YaakColor('#2a273f', 'dark'),
    },
    sidebar: {
      surface: new YaakColor('#2a273f', 'dark'),
    },
    menu: {
      surface: new YaakColor('#393552', 'dark'),
      textSubtle: new YaakColor('#908caa', 'dark').lift(0.15),
      textSubtlest: new YaakColor('#6e6a86', 'dark').lift(0.15),
      border: new YaakColor('#393552', 'dark').lift(0.2),
      borderSubtle: new YaakColor('#393552', 'dark').lift(0.12),
    },
  },
};

const rosePineDawn: YaakTheme = {
  id: 'rose-pine-dawn',
  name: 'Rosé Pine Dawn',
  surface: new YaakColor('#faf4ed', 'light'),
  border: new YaakColor('#dfdad9', 'light'),
  surfaceHighlight: new YaakColor('#f4ede8', 'light'),
  text: new YaakColor('#575279', 'light'),
  textSubtle: new YaakColor('#797593', 'light'),
  textSubtlest: new YaakColor('#9893a5', 'light'),
  primary: new YaakColor('#9070ad', 'light'),
  secondary: new YaakColor('#6e6a86', 'light'),
  info: new YaakColor('#2d728d', 'light'),
  success: new YaakColor('#4f8c96', 'light'),
  notice: new YaakColor('#cb862d', 'light'),
  warning: new YaakColor('#ce7b78', 'light'),
  danger: new YaakColor('#b4637a', 'light'),
  components: {
    responsePane: {
      border: new YaakColor('#e8e4e2', 'light'),
    },
    sidebar: {
      border: new YaakColor('#e8e4e2', 'light'),
    },
    appHeader: {
      border: new YaakColor('#e8e4e2', 'light'),
    },
    input: {
      border: new YaakColor('#dfdad9', 'light'),
    },
    dialog: {
      border: new YaakColor('#e8e4e2', 'light'),
    },
    menu: {
      surface: new YaakColor('#f2e9e1', 'light'),
      border: new YaakColor('#dfdad9', 'light'),
    },
  },
};

export const rosePine = [rosePineDefault, rosePineDawn, rosePineMoon];
