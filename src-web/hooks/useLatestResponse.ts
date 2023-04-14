import type { HttpResponse } from '../lib/models';
import { useResponses } from './useResponses';

export function useLatestResponse(requestId: string | null): HttpResponse | null {
  const responses = useResponses(requestId);
  return responses[0] ?? null;
}
