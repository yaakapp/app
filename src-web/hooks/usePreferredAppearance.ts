import { useEffect, useState } from 'react';
import {
  getCSSAppearance,
  getWindowAppearance,
  subscribeToWindowAppearanceChange,
} from '../lib/theme/appearance';
import { type Appearance } from '../lib/theme/window';

export function usePreferredAppearance() {
  const [preferredAppearance, setPreferredAppearance] = useState<Appearance>(getCSSAppearance());

  useEffect(() => {
    getWindowAppearance().then(setPreferredAppearance);
    return subscribeToWindowAppearanceChange(setPreferredAppearance);
  }, []);

  return preferredAppearance;
}
