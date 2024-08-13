import { YaakColor } from '../yaakColor';
import type { YaakTheme } from '../window';

const githubDark: YaakTheme = {
  id: 'github-dark',
  name: 'GitHub',
  surface: new YaakColor('#0d1218', 'dark'),
  border: new YaakColor('#171c23', 'dark'),
  surfaceHighlight: new YaakColor('#1c2127', 'dark'),
  text: new YaakColor('#dce3eb', 'dark'),
  textSubtle: new YaakColor('#88919b', 'dark'),
  textSubtlest: new YaakColor('#6b727d', 'dark'),
  primary: new YaakColor('#a579ef', 'dark').lift(0.1),
  secondary: new YaakColor('#6b727d', 'dark').lift(0.1),
  info: new YaakColor('#458def', 'dark').lift(0.1),
  success: new YaakColor('#3eb24f', 'dark').lift(0.1),
  notice: new YaakColor('#dca132', 'dark').lift(0.1),
  warning: new YaakColor('#ec7934', 'dark').lift(0.1),
  danger: new YaakColor('#ee5049', 'dark').lift(0.1),
  components: {
    button: {
      primary: new YaakColor('#a579ef', 'dark'),
      secondary: new YaakColor('#6b727d', 'dark'),
      info: new YaakColor('#458def', 'dark'),
      success: new YaakColor('#3eb24f', 'dark'),
      notice: new YaakColor('#dca132', 'dark'),
      warning: new YaakColor('#ec7934', 'dark'),
      danger: new YaakColor('#ee5049', 'dark'),
    },
  },
};

export const githubLight: YaakTheme = {
  id: 'github-light',
  name: 'GitHub',
  surface: new YaakColor('#ffffff', 'light'),
  surfaceHighlight: new YaakColor('hsl(210,29%,94%)', 'light'),
  border: new YaakColor('hsl(210,15%,92%)', 'light'),
  borderSubtle: new YaakColor('hsl(210,15%,92%)', 'light'),
  text: new YaakColor('#1f2328', 'light'),
  textSubtle: new YaakColor('#636c76', 'light'),
  textSubtlest: new YaakColor('#828d94', 'light'),
  primary: new YaakColor('#8250df', 'light'),
  secondary: new YaakColor('#6e7781', 'light'),
  info: new YaakColor('hsl(212,92%,48%)', 'light'),
  success: new YaakColor('hsl(137,66%,32%)', 'light'),
  notice: new YaakColor('hsl(40,100%,40%)', 'light'),
  warning: new YaakColor('hsl(24,100%,44%)', 'light'),
  danger: new YaakColor('#d1242f', 'light'),
};

export const github = [githubDark, githubLight];
