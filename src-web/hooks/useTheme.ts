import { useEffect } from 'react';
import type { Appearance } from '../lib/theme/window';
import {
  getAppearance,
  setAppearance,
  subscribeToPreferredAppearanceChange,
} from '../lib/theme/window';
import { useKeyValues } from './useKeyValues';

export function useTheme() {
  const appearanceKv = useKeyValues({ key: 'appearance', initialValue: getAppearance() });

  const themeChange = (appearance: Appearance) => {
    appearanceKv.set(appearance);
  };

  const handleToggleAppearance = async () => {
    appearanceKv.set(appearanceKv.value === 'dark' ? 'light' : 'dark');
  };

  // Set appearance when preferred theme changes
  useEffect(() => subscribeToPreferredAppearanceChange(themeChange), []);

  // Sync appearance when k/v changes
  useEffect(() => setAppearance(appearanceKv.value as Appearance), [appearanceKv.value]);

  return {
    appearance: appearanceKv.value,
    toggleAppearance: handleToggleAppearance,
  };
}
