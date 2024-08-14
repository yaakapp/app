import { useEffect, useState } from 'react';
import type { Appearance } from '../lib/theme/appearance';
import {
  getCSSAppearance,
  getWindowAppearance,
  subscribeToWindowAppearanceChange,
} from '../lib/theme/appearance';

export function usePreferredAppearance() {
  const [preferredAppearance, setPreferredAppearance] = useState<Appearance>(getCSSAppearance());

  useEffect(() => {
    getWindowAppearance().then(setPreferredAppearance);
    return subscribeToWindowAppearanceChange(setPreferredAppearance);
  }, []);

  return preferredAppearance;
}
