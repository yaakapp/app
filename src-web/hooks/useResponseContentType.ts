import { useMemo } from 'react';
import type { HttpResponse } from '../lib/models';

export function useResponseContentType(response: HttpResponse | null): string | null {
  return useMemo(
    () => response?.headers.find((h) => h.name.toLowerCase() === 'content-type')?.value ?? null,
    [response],
  );
}
