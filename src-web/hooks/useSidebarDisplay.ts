import { useCallback, useMemo } from 'react';
import { NAMESPACE_NO_SYNC } from '../lib/keyValueStore';
import { useKeyValue } from './useKeyValue';

const START_WIDTH = 200;
const MIN_WIDTH = 150;
const COLLAPSE_WIDTH = MIN_WIDTH * 0.25;

export const sidebarDisplayKey = 'sidebar_display';
export const sidebarDisplayDefaultValue: SidebarDisplay = { hidden: false, width: START_WIDTH };

export interface SidebarDisplay {
  hidden: boolean;
  width: number;
}

export function useSidebarDisplay() {
  const display = useKeyValue<SidebarDisplay>({
    namespace: NAMESPACE_NO_SYNC,
    key: sidebarDisplayKey,
    defaultValue: sidebarDisplayDefaultValue,
  });
  const hidden = display.value?.hidden ?? false;
  const width = display.value?.width ?? START_WIDTH;

  const set = useCallback(
    (width: number) => {
      const hidden = width < COLLAPSE_WIDTH;
      display.set({ hidden, width: Math.max(MIN_WIDTH, width) });
    },
    [display],
  );
  const hide = useCallback(() => display.set((v) => ({ ...v, hidden: true })), [display]);
  const show = useCallback(() => display.set((v) => ({ ...v, hidden: false })), [display]);
  const toggle = useCallback(() => display.set((v) => ({ ...v, hidden: !v.hidden })), [display]);
  const reset = display.reset;

  return useMemo(
    () => ({ width, hidden, set, reset, hide, show, toggle }),
    [hidden, hide, reset, set, show, toggle, width],
  );
}
