import { useEffect, useState } from 'react';
import type { Appearance } from '../lib/theme/appearance';
import { getCSSAppearance } from '../lib/theme/appearance';
import { subscribeToPreferredAppearance } from '../lib/theme/window';

export function usePreferredAppearance() {
  const [preferredAppearance, setPreferredAppearance] = useState<Appearance>(getCSSAppearance());
  useEffect(() => subscribeToPreferredAppearance(setPreferredAppearance), []);
  return preferredAppearance;
}
