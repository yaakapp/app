import { useResponses } from './useResponses';

export function useIsResponseLoading(requestId: string | null): boolean {
  const responses = useResponses(requestId);
  const response = responses[responses.length - 1];
  if (!response) return false;
  return !(response.body || response.status || response.error);
}
