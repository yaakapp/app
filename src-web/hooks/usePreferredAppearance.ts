import { useEffect, useState } from 'react';
import {
  type Appearance,
  getPreferredAppearance,
  subscribeToPreferredAppearanceChange,
} from '../lib/theme/window';

export function usePreferredAppearance() {
  const [preferredAppearance, setPreferredAppearance] = useState<Appearance>();

  // Set appearance when preferred theme changes
  useEffect(() => {
    getPreferredAppearance().then(setPreferredAppearance);
    return subscribeToPreferredAppearanceChange(setPreferredAppearance);
  }, []);

  return preferredAppearance;
}
