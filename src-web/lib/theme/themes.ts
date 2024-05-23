import { catppuccin } from './themes/catppuccin';
import { github } from './themes/github';
import { monokaiPro } from './themes/monokai-pro';
import { relaxing } from './themes/relaxing';
import { rosePine } from './themes/rose-pine';
import { yaak, yaakDark, yaakLight } from './themes/yaak';

export const yaakThemes = [
  ...yaak,
  ...catppuccin,
  ...relaxing,
  ...rosePine,
  ...github,
  ...monokaiPro,
];

export const defaultDarkTheme = yaakDark;
export const defaultLightTheme = yaakLight;
