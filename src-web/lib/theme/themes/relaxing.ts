import { YaakColor } from '../yaakColor';
import type { YaakTheme } from '../window';

const relaxingDefault: YaakTheme = {
  name: 'Relaxing',
  id: 'relaxing',
  surface: new YaakColor('#2b1e3b', 'dark'),
  text: new YaakColor('#ede2f5', 'dark'),
  primary: new YaakColor('#cba6f7', 'dark'),
  secondary: new YaakColor('#bac2de', 'dark'),
  info: new YaakColor('#89b4fa', 'dark'),
  success: new YaakColor('#a6e3a1', 'dark'),
  notice: new YaakColor('#f9e2af', 'dark'),
  warning: new YaakColor('#fab387', 'dark'),
  danger: new YaakColor('#f38ba8', 'dark'),
};

export const relaxing = [relaxingDefault];
