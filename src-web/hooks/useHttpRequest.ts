import type { HttpRequest } from '@yaakapp/api';
import { useHttpRequests } from './useHttpRequests';

export function useHttpRequest(id: string | null): HttpRequest | null {
  const requests = useHttpRequests();
  return requests.find((r) => r.id === id) ?? null;
}
