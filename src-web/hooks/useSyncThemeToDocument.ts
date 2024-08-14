import { emit } from '@tauri-apps/api/event';
import { useEffect } from 'react';
import type { YaakTheme } from '../lib/theme/window';
import { addThemeStylesToDocument, setThemeOnDocument } from '../lib/theme/window';
import { useResolvedTheme } from './useResolvedTheme';

export function useSyncThemeToDocument() {
  const theme = useResolvedTheme();

  useEffect(() => {
    setThemeOnDocument(theme.active);
    emitBgChange(theme.active);
  }, [theme.active]);

  useEffect(() => {
    addThemeStylesToDocument(theme.active);
  }, [theme.active]);
}

function emitBgChange(t: YaakTheme) {
  if (t.surface == null) return;
  emit('yaak_bg_changed', t.surface.hexNoAlpha()).catch(console.error);
}
