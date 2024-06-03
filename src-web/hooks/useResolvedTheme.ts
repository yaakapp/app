import { isThemeDark } from '../lib/theme/window';
import { useResolvedAppearance } from './useResolvedAppearance';
import { useSettings } from './useSettings';
import { useThemes } from './useThemes';

export function useResolvedTheme() {
  const appearance = useResolvedAppearance();
  const settings = useSettings();
  const { themes, fallback } = useThemes();

  const darkThemes = themes.filter((t) => isThemeDark(t));
  const lightThemes = themes.filter((t) => !isThemeDark(t));

  const dark = darkThemes.find((t) => t.id === settings?.themeDark) ?? fallback.dark;
  const light = lightThemes.find((t) => t.id === settings?.themeLight) ?? fallback.light;

  const active = appearance === 'dark' ? dark : light;

  return { dark, light, active };
}
