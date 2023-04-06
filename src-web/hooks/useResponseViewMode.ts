import { useLocalStorage } from 'react-use';

export function useResponseViewMode(
  requestId?: string,
): [string | undefined, (m: 'pretty' | 'raw') => void] {
  const [value, setValue] = useLocalStorage<'pretty' | 'raw'>(
    `response_view_mode::${requestId}`,
    'pretty',
  );
  return [value, setValue];
}
