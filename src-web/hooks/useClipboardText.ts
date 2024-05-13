import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';
import { useCallback, useEffect, useState } from 'react';
import { useWindowFocus } from './useWindowFocus';

export function useClipboardText() {
  const [value, setValue] = useState<string>('');
  const focused = useWindowFocus();

  useEffect(() => {
    readText().then(setValue);
  }, [focused]);

  const setText = useCallback((text: string) => {
    writeText(text).catch(console.error);
  }, []);

  return [value, setText] as const;
}
