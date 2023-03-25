import { useCallback } from 'react';
import { clamp } from '../lib/clamp';
import { useKeyValue } from './useKeyValue';

const START_WIDTH = 200;
const MIN_WIDTH = 110;
const MAX_WIDTH = 500;

export enum SidebarDisplayKeys {
  width = 'sidebar_width',
  hidden = 'sidebar_hidden',
}

export function useSidebarDisplay() {
  const hiddenKv = useKeyValue<boolean>({ key: SidebarDisplayKeys.hidden, defaultValue: false });
  const widthKv = useKeyValue<number>({ key: SidebarDisplayKeys.width, defaultValue: START_WIDTH });
  const hidden = hiddenKv.value;
  const width = widthKv.value ?? START_WIDTH;

  const set = useCallback((v: number) => widthKv.set(clamp(v, MIN_WIDTH, MAX_WIDTH)), []);
  const reset = useCallback(() => widthKv.set(START_WIDTH), []);
  const hide = useCallback(() => hiddenKv.set(true), []);
  const show = useCallback(() => hiddenKv.set(false), []);
  const toggle = useCallback(() => hiddenKv.set(!hiddenKv.value), [hiddenKv.value]);

  return { width, hidden, set, reset, hide, show, toggle };
}
