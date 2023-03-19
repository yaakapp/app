import type { HttpRequest } from '../lib/models';
import { useRequests } from './useRequests';

export function useRequest(id: string | null): HttpRequest | null {
  const requests = useRequests();
  return requests.find((r) => r.id === id) ?? null;
}
