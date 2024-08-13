import { YaakColor } from '../yaakColor';
import type { YaakTheme } from '../window';

export const hotdogStandDefault: YaakTheme = {
  id: 'hotdog-stand',
  name: 'Hotdog Stand',
  surface: new YaakColor('#ff0000', 'dark'),
  border: new YaakColor('#000000', 'dark'),
  surfaceHighlight: new YaakColor('#000000', 'dark'),
  text: new YaakColor('#ffffff', 'dark'),
  textSubtle: new YaakColor('#ffffff', 'dark'),
  textSubtlest: new YaakColor('#ffff00', 'dark'),
  primary: new YaakColor('#ffff00', 'dark'),
  secondary: new YaakColor('#ffff00', 'dark'),
  info: new YaakColor('#ffff00', 'dark'),
  success: new YaakColor('#ffff00', 'dark'),
  notice: new YaakColor('#ffff00', 'dark'),
  warning: new YaakColor('#ffff00', 'dark'),
  danger: new YaakColor('#ffff00', 'dark'),
  components: {
    appHeader: {
      surface: new YaakColor('#000000', 'dark'),
      text: new YaakColor('#ffffff', 'dark'),
      textSubtle: new YaakColor('#ffff00', 'dark'),
      textSubtlest: new YaakColor('#ff0000', 'dark'),
    },
    menu: {
      surface: new YaakColor('#000000', 'dark'),
      border: new YaakColor('#ff0000', 'dark'),
      surfaceHighlight: new YaakColor('#ff0000', 'dark'),
      text: new YaakColor('#ffffff', 'dark'),
      textSubtle: new YaakColor('#ffff00', 'dark'),
      textSubtlest: new YaakColor('#ffff00', 'dark'),
    },
    button: {
      surface: new YaakColor('#000000', 'dark'),
      text: new YaakColor('#ffffff', 'dark'),
      primary: new YaakColor('#000000', 'dark'),
      secondary: new YaakColor('#ffffff', 'dark'),
      info: new YaakColor('#000000', 'dark'),
      success: new YaakColor('#ffff00', 'dark'),
      notice: new YaakColor('#ffff00', 'dark'),
      warning: new YaakColor('#000000', 'dark'),
      danger: new YaakColor('#ff0000', 'dark'),
    },
    editor: {
      primary: new YaakColor('#ffffff', 'dark'),
      secondary: new YaakColor('#ffffff', 'dark'),
      info: new YaakColor('#ffffff', 'dark'),
      success: new YaakColor('#ffffff', 'dark'),
      notice: new YaakColor('#ffff00', 'dark'),
      warning: new YaakColor('#ffffff', 'dark'),
      danger: new YaakColor('#ffffff', 'dark'),
    },
  },
};

export const hotdogStand = [hotdogStandDefault];
