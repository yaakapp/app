import { useMemo } from 'react';
import type { HttpResponseHeader } from '@yaakapp/api';

export function useContentTypeFromHeaders(headers: HttpResponseHeader[] | null): string | null {
  return useMemo(
    () => headers?.find((h) => h.name.toLowerCase() === 'content-type')?.value ?? null,
    [headers],
  );
}
