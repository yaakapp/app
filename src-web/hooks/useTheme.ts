import { useEffect } from 'react';
import { getKeyValue } from '../lib/keyValueStore';
import type { Appearance } from '../lib/theme/window';
import {
  getAppearance,
  getPreferredAppearance,
  setAppearance,
  subscribeToPreferredAppearanceChange,
} from '../lib/theme/window';
import { useKeyValue } from './useKeyValue';

export function useTheme() {
  const appearanceKv = useKeyValue<Appearance>({
    key: 'appearance',
    defaultValue: getAppearance(),
  });

  const handleToggleAppearance = async () => {
    appearanceKv.set(appearanceKv.value === 'dark' ? 'light' : 'dark');
  };

  // Set appearance when preferred theme changes
  useEffect(() => subscribeToPreferredAppearanceChange(appearanceKv.set), [appearanceKv.set]);

  // Sync appearance when k/v changes
  useEffect(() => setAppearance(appearanceKv.value), [appearanceKv.value]);

  return {
    appearance: appearanceKv.value ?? getAppearance(),
    toggleAppearance: handleToggleAppearance,
  };
}

export async function getAppearanceKv() {
  return getKeyValue<Appearance>({
    key: 'appearance',
    fallback: getPreferredAppearance(),
  });
}
