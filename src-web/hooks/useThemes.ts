import { defaultDarkTheme, defaultLightTheme, yaakThemes } from '../lib/theme/themes';

export function useThemes() {
  const dark = defaultDarkTheme;
  const light = defaultLightTheme;

  const otherThemes = yaakThemes
    .filter((t) => t.id !== dark.id && t.id !== light.id)
    .sort((a, b) => a.name.localeCompare(b.name));

  const themes = [dark, light, ...otherThemes];
  return { themes, fallback: { dark, light } };
}
