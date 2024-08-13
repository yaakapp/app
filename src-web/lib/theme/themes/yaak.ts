import { YaakColor } from '../yaakColor';
import type { YaakTheme } from '../window';

export const yaakLight: YaakTheme = {
  id: 'yaak-light',
  name: 'Yaak',
  surface: new YaakColor('hsl(216,24%,100%)', 'light'),
  border: new YaakColor('hsl(216,24%,93%)', 'light'),
  surfaceHighlight: new YaakColor('hsl(216,24%,87%)', 'light'),
  text: new YaakColor('hsl(219,23%,15%)', 'light'),
  textSubtle: new YaakColor('hsl(219,23%,15%)', 'light').lower(0.3),
  textSubtlest: new YaakColor('hsl(219,23%,15%)', 'light').lower(0.5),
  primary: new YaakColor('hsl(266,100%,70%)', 'light'),
  secondary: new YaakColor('hsl(220,24%,59%)', 'light'),
  info: new YaakColor('hsl(206,100%,48%)', 'light'),
  success: new YaakColor('hsl(155,95%,33%)', 'light'),
  notice: new YaakColor('hsl(45,100%,41%)', 'light'),
  warning: new YaakColor('hsl(30,100%,43%)', 'light'),
  danger: new YaakColor('hsl(335,75%,57%)', 'light'),
  components: {
    sidebar: {
      surface: new YaakColor('hsl(216,24%,97%)', 'light'),
      border: new YaakColor('hsl(216,24%,93%)', 'light'),
      surfaceHighlight: new YaakColor('hsl(216,24%,90%)', 'light'),
    },
  },
};

export const yaakDark: YaakTheme = {
  id: 'yaak-dark',
  name: 'Yaak',
  surface: new YaakColor('hsl(244,23%,14%)', 'dark'),
  border: new YaakColor('hsl(244,23%,25%)', 'dark'),
  surfaceHighlight: new YaakColor('hsl(244,23%,20%)', 'dark'),
  text: new YaakColor('hsl(245,23%,84%)', 'dark'),
  textSubtle: new YaakColor('hsl(245,18%,58%)', 'dark'),
  textSubtlest: new YaakColor('hsl(245,18%,45%)', 'dark'),
  primary: new YaakColor('hsl(266,100%,79%)', 'dark'),
  secondary: new YaakColor('hsl(245,23%,60%)', 'dark'),
  info: new YaakColor('hsl(206,100%,63%)', 'dark'),
  success: new YaakColor('hsl(150,99%,44%)', 'dark'),
  notice: new YaakColor('hsl(48,80%,63%)', 'dark'),
  warning: new YaakColor('hsl(28,100%,61%)', 'dark'),
  danger: new YaakColor('hsl(342,90%,68%)', 'dark'),

  components: {
    button: {
      primary: new YaakColor('hsl(266,100%,79%)', 'dark').lower(0.1),
      secondary: new YaakColor('hsl(245,23%,60%)', 'dark').lower(0.1),
      info: new YaakColor('hsl(206,100%,63%)', 'dark').lower(0.1),
      success: new YaakColor('hsl(150,99%,44%)', 'dark').lower(0.15),
      notice: new YaakColor('hsl(48,80%,63%)', 'dark').lower(0.2),
      warning: new YaakColor('hsl(28,100%,61%)', 'dark').lower(0.1),
      danger: new YaakColor('hsl(342,90%,68%)', 'dark').lower(0.1),
    },
    dialog: {
      border: new YaakColor('hsl(244,23%,24%)', 'dark'),
    },
    sidebar: {
      surface: new YaakColor('hsl(243,23%,16%)', 'dark'),
      border: new YaakColor('hsl(244,23%,22%)', 'dark'),
    },
    responsePane: {
      surface: new YaakColor('hsl(243,23%,16%)', 'dark'),
      border: new YaakColor('hsl(244,23%,16%)', 'dark').lift(0.08),
    },
    appHeader: {
      surface: new YaakColor('hsl(244,23%,12%)', 'dark'),
      border: new YaakColor('hsl(244,23%,12%)', 'dark').lift(0.1),
    },
  },
};

export const yaak = [yaakDark, yaakLight];
