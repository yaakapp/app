import { useEffect } from 'react';
import { setTheme, subscribeToPreferredThemeChange, toggleTheme } from '../lib/theme';

export default function useTheme(subscribeToChanges = true): { toggleTheme: () => void } {
  useEffect(() => {
    if (!subscribeToChanges) return;
    const unsub = subscribeToPreferredThemeChange(setTheme);
    return unsub;
  }, [subscribeToChanges]);

  return {
    toggleTheme: toggleTheme,
  };
}
