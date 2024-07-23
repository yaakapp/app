import { readText, writeText } from '@tauri-apps/plugin-clipboard-manager';
import { useCallback, useEffect } from 'react';
import { useToast } from '../components/ToastContext';
import { useWindowFocus } from './useWindowFocus';
import { createGlobalState } from 'react-use';

const useClipboardTextState = createGlobalState<string>('');

export function useClipboardText({ disableToast }: { disableToast?: boolean } = {}) {
  const [value, setValue] = useClipboardTextState();
  const focused = useWindowFocus();
  const toast = useToast();

  useEffect(() => {
    readText().then(setValue);
  }, [focused, setValue]);

  const setText = useCallback(
    (text: string) => {
      writeText(text).catch(console.error);
      if (text != '' && !disableToast) {
        toast.show({
          id: 'copied',
          variant: 'copied',
          message: 'Copied to clipboard',
        });
      }
      setValue(text);
    },
    [disableToast, setValue, toast],
  );

  return [value, setText] as const;
}
