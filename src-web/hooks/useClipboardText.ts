import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';
import { useCallback, useEffect } from 'react';
import { useWindowFocus } from './useWindowFocus';
import { createGlobalState } from 'react-use';

const useClipboardTextState = createGlobalState<string>('');

export function useClipboardText() {
  const [value, setValue] = useClipboardTextState();
  const focused = useWindowFocus();

  useEffect(() => {
    readText().then(setValue);
  }, [focused, setValue]);

  const setText = useCallback(
    (text: string) => {
      writeText(text).catch(console.error);
      setValue(text);
    },
    [setValue],
  );

  return [value, setText] as const;
}
