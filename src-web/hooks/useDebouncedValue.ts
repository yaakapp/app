import { useEffect, useRef, useState } from 'react';

export function useDebouncedValue<T extends string | number>(value: T, delay = 1000) {
  const [state, setState] = useState<T>(value);
  const timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearTimeout(timeout.current ?? 0);
    timeout.current = setTimeout(() => setState(value), delay);
  }, [value, delay]);

  return state;
}
