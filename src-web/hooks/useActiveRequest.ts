import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { HttpRequest } from '../lib/models';
import { useRequests } from './useRequests';

export function useActiveRequest(): HttpRequest | null {
  const params = useParams<{ requestId?: string }>();
  const requests = useRequests();
  const [activeRequest, setActiveRequest] = useState<HttpRequest | null>(null);

  useEffect(() => {
    if (requests.length === 0) {
      setActiveRequest(null);
    } else {
      setActiveRequest(requests.find((r) => r.id === params.requestId) ?? null);
    }
  }, [requests, params.requestId]);

  return activeRequest;
}
