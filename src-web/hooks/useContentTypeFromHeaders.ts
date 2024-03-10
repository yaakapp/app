import { useMemo } from 'react';
import type { HttpHeader } from '../lib/models';

export function useContentTypeFromHeaders(headers: HttpHeader[] | null): string | null {
  return useMemo(
    () => headers?.find((h) => h.name.toLowerCase() === 'content-type')?.value ?? null,
    [headers],
  );
}
