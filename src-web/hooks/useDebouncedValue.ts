import { useEffect } from 'react';
import { useDebouncedSetState } from './useDebouncedSetState';

export function useDebouncedValue<T>(value: T, delay?: number) {
  const [state, setState] = useDebouncedSetState<T>(value, delay);
  useEffect(() => setState(value), [setState, value]);
  return state;
}
