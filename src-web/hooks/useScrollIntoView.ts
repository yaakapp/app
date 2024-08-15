import { useEffect } from 'react';

export function useScrollIntoView<T extends HTMLElement>(node: T | null, active: boolean) {
  useEffect(() => {
    if (active) {
      node?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [active, node]);
}
