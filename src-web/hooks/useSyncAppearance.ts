import { useEffect, useState } from 'react';
import type { Appearance } from '../lib/theme/window';
import {
  setAppearanceOnDocument,
  getPreferredAppearance,
  subscribeToPreferredAppearanceChange,
} from '../lib/theme/window';
import { useSettings } from './useSettings';

export function useSyncAppearance() {
  const [preferredAppearance, setPreferredAppearance] = useState<Appearance>(
    getPreferredAppearance(),
  );

  const settings = useSettings();

  // Set appearance when preferred theme changes
  useEffect(() => {
    return subscribeToPreferredAppearanceChange(setPreferredAppearance);
  }, []);

  const appearance =
    settings == null || settings?.appearance === 'system'
      ? preferredAppearance
      : settings.appearance;

  useEffect(() => {
    if (settings == null) {
      return;
    }
    setAppearanceOnDocument(settings.appearance as Appearance);
  }, [appearance, settings]);

  return { appearance };
}
