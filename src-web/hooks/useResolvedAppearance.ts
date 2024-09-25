import { resolveAppearance } from '../lib/theme/themes';
import { usePreferredAppearance } from './usePreferredAppearance';
import { useSettings } from './useSettings';

export function useResolvedAppearance() {
  const preferredAppearance = usePreferredAppearance();
  const settings = useSettings();
  return resolveAppearance(preferredAppearance, settings.appearance);
}
