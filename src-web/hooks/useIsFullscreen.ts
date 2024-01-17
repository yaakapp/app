import { appWindow } from '@tauri-apps/api/window';
import { useEffect, useState } from 'react';
import { useWindowSize } from 'react-use';

export function useIsFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const windowSize = useWindowSize();

  useEffect(() => {
    (async function () {
      // Fullscreen state isn't updated right after resize event on Mac (needs to wait for animation) so
      // we'll poll for 10 seconds to see if it changes. Hopefully Tauri eventually adds a way to listen
      // for this.
      for (let i = 0; i < 100; i++) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const newIsFullscreen = await appWindow.isFullscreen();
        if (newIsFullscreen !== isFullscreen) {
          setIsFullscreen(newIsFullscreen);
          break;
        }
      }
    })();
  }, [windowSize, isFullscreen]);

  return isFullscreen;
}
