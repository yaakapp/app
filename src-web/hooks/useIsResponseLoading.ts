import { useResponses } from './useResponses';

export function useIsResponseLoading(): boolean {
  const responses = useResponses();
  const response = responses[responses.length - 1];
  if (!response) return false;
  return !(response.body || response.status || response.error);
}
