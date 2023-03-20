import type { HttpRequest } from '../lib/models';
import { useActiveRequestId } from './useActiveRequestId';
import { useRequests } from './useRequests';

export function useActiveRequest(): HttpRequest | null {
  const requestId = useActiveRequestId();
  const requests = useRequests();
  return requests.find((r) => r.id === requestId) ?? null;
}
