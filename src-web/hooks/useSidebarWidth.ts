import { useCallback } from 'react';
import { clamp } from '../lib/clamp';
import { useKeyValue } from './useKeyValue';

const INITIAL_WIDTH = 200;

const MIN_WIDTH = 110;
const MAX_WIDTH = 500;

export function useSidebarWidth() {
  const width = useKeyValue<number>({ key: 'sidebar_width', defaultValue: INITIAL_WIDTH });

  const setWidth = useCallback((v: number) => {
    width.set(clamp(v, MIN_WIDTH, MAX_WIDTH));
  }, []);

  const resetWidth = useCallback(() => {
    width.set(INITIAL_WIDTH);
  }, []);

  return { value: width.value ?? INITIAL_WIDTH, set: setWidth, reset: resetWidth };
}
