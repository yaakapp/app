import type { YaakTheme } from '../window';
import { YaakColor } from '../yaakColor';

const draculaDefault: YaakTheme = {
  id: 'dracula',
  name: 'Dracula',
  surface: new YaakColor('#282A36', 'dark'),
  surfaceHighlight: new YaakColor('#343746', 'dark'),
  text: new YaakColor('#F8F8F2', 'dark'),
  textSubtle: new YaakColor('hsl(232,14%,65%)', 'dark'),
  textSubtlest: new YaakColor('hsl(232,14%,50%)', 'dark'),
  primary: new YaakColor('#BD93F9', 'dark'),
  secondary: new YaakColor('#6272A4', 'dark'),
  info: new YaakColor('#8BE9FD', 'dark'),
  success: new YaakColor('#50FA7B', 'dark'),
  notice: new YaakColor('#F1FA8C', 'dark'),
  warning: new YaakColor('#FFB86C', 'dark'),
  danger: new YaakColor('#FF5555', 'dark'),
  components: {
    sidebar: {
      backdrop: new YaakColor('hsl(230,15%,24%)', 'dark'),
    },
    appHeader: {
      backdrop: new YaakColor('#21222C', 'dark'),
    },
  },
};

export const dracula = [draculaDefault];
