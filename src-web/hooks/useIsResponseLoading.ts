import { isResponseLoading } from '../lib/models';
import { useLatestResponse } from './useLatestResponse';

export function useIsResponseLoading(requestId: string | null): boolean {
  const response = useLatestResponse(requestId);
  if (response === null) return false;
  return isResponseLoading(response);
}
