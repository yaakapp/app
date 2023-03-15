import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Appearance } from '../lib/theme/window';
import {
  getAppearance,
  setAppearance,
  subscribeToPreferredAppearanceChange,
  toggleAppearance,
} from '../lib/theme/window';

export function appearanceQueryKey() {
  return ['theme', 'appearance'];
}

export function useTheme() {
  const queryClient = useQueryClient();
  const appearance = useQuery({
    queryKey: appearanceQueryKey(),
    queryFn: getAppearance,
    initialData: getAppearance(),
  }).data;

  const themeChange = (appearance: Appearance) => {
    setAppearance(appearance);
  };

  const handleToggleAppearance = async () => {
    const newAppearance = toggleAppearance();
    await queryClient.setQueryData(appearanceQueryKey(), newAppearance);
  };

  useEffect(() => subscribeToPreferredAppearanceChange(themeChange), []);

  return {
    appearance,
    toggleAppearance: handleToggleAppearance,
  };
}
