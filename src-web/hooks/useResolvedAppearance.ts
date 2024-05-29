import { usePreferredAppearance } from './usePreferredAppearance';
import { useSettings } from './useSettings';

export function useResolvedAppearance() {
  const preferredAppearance = usePreferredAppearance();

  const settings = useSettings();
  const appearance =
    settings == null || settings?.appearance === 'system'
      ? preferredAppearance
      : settings.appearance;

  return appearance;
}
