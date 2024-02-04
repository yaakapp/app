import type { HttpResponse } from '../lib/models';
import { useHttpResponses } from './useHttpResponses';

export function useLatestResponse(requestId: string | null): HttpResponse | null {
  const responses = useHttpResponses(requestId);
  return responses[0] ?? null;
}
