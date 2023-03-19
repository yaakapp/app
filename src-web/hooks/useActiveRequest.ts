import { useEffect, useState } from 'react';
import type { HttpRequest } from '../lib/models';
import { useActiveRequestId } from './useActiveRequestId';
import { useRequests } from './useRequests';

export function useActiveRequest(): HttpRequest | null {
  const requests = useRequests();
  const requestId = useActiveRequestId();
  const [activeRequest, setActiveRequest] = useState<HttpRequest | null>(null);

  useEffect(() => {
    setActiveRequest(requests.find((r) => r.id === requestId) ?? null);
  }, [requests, requestId]);

  return activeRequest;
}
