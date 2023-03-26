import { useCallback, useMemo } from 'react';
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
    [display.set],
  );
  const hide = useCallback(() => display.set((v) => ({ ...v, hidden: true })), [display.set]);
  const show = useCallback(() => display.set((v) => ({ ...v, hidden: false })), [display.set]);
  const toggle = useMemo(() => (hidden ? show : hide), [hidden, show, hide]);
  const reset = display.reset;

  return { width, hidden, set, reset, hide, show, toggle };
}
