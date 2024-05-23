import { useEffect, useState } from 'react';
import type { Appearance } from '../lib/theme/window';
import { getPreferredAppearance, subscribeToPreferredAppearanceChange } from '../lib/theme/window';
import { useSettings } from './useSettings';

export function useResolvedAppearance() {
  const [preferredAppearance, setPreferredAppearance] = useState<Appearance>(
    getPreferredAppearance(),
  );

  // Set appearance when preferred theme changes
  useEffect(() => {
    return subscribeToPreferredAppearanceChange(setPreferredAppearance);
  }, []);

  const settings = useSettings();
  const appearance =
    settings == null || settings?.appearance === 'system'
      ? preferredAppearance
      : settings.appearance;

  return appearance;
}
