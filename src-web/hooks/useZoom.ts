import { useCallback } from 'react';
import { useSettings } from './useSettings';
import { useUpdateSettings } from './useUpdateSettings';

export function useZoom() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();

  const zoomIn = useCallback(() => {
    if (!settings) return;
    updateSettings.mutate({
      ...settings,
      interfaceScale: Math.min(1.8, settings.interfaceScale * 1.1),
    });
  }, [settings, updateSettings]);

  const zoomOut = useCallback(() => {
    if (!settings) return;
    updateSettings.mutate({
      ...settings,
      interfaceScale: Math.max(0.4, settings.interfaceScale * 0.9),
    });
  }, [settings, updateSettings]);

  const zoomReset = useCallback(() => {
    if (!settings) return;
    updateSettings.mutate({ ...settings, interfaceScale: 1 });
  }, [settings, updateSettings]);

  return { zoomIn, zoomOut, zoomReset };
}
