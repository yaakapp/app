import type { Dispatch, SetStateAction } from 'react';
import { useMemo, useState } from 'react';
import { debounce } from '../lib/debounce';

export function useDebouncedState<T>(
  defaultValue: T,
  delay = 500,
): [T, Dispatch<SetStateAction<T>>, Dispatch<SetStateAction<T>>] {
  const [state, setState] = useState<T>(defaultValue);
  const debouncedSetState = useMemo(() => debounce(setState, delay), [delay]);
  return [state, debouncedSetState, setState];
}
