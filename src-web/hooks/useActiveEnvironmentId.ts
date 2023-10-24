import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useActiveEnvironmentId(): [string | null, (id: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('environmentId') ?? null;

  const setId = useCallback((id: string) => {
    searchParams.set('environmentId', id)
    setSearchParams(searchParams);
  }, [searchParams, setSearchParams])

  return [id, setId];
}
