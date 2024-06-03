import { getCurrent } from '@tauri-apps/api/webviewWindow';
import type { Appearance } from './window';

export function getCSSAppearance(): Appearance {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export async function getWindowAppearance(): Promise<Appearance> {
  const a = await getCurrent().theme();
  return a ?? getCSSAppearance();
}

/**
 * Subscribe to appearance (dark/light) changes. Note, we use Tauri Window appearance instead of
 * CSS appearance because CSS won't fire the way we handle window theme management.
 */
export function subscribeToWindowAppearanceChange(
  cb: (appearance: Appearance) => void,
): () => void {
  const container = { unsubscribe: () => {} };

  getCurrent()
    .onThemeChanged((t) => {
      cb(t.payload);
    })
    .then((l) => {
      container.unsubscribe = l;
    });

  return () => container.unsubscribe();
}
