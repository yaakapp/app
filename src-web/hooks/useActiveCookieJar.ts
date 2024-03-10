import { useEffect } from 'react';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useCookieJars } from './useCookieJars';
import { useKeyValue } from './useKeyValue';

export function useActiveCookieJar() {
  const workspaceId = useActiveWorkspaceId();
  const cookieJars = useCookieJars();

  const kv = useKeyValue<string | null>({
    namespace: 'global',
    key: ['activeCookieJar', workspaceId ?? 'n/a'],
    fallback: null,
  });

  const activeCookieJar = cookieJars.find((cookieJar) => cookieJar.id === kv.value);

  useEffect(() => {
    if (!kv.isLoading && activeCookieJar == null && cookieJars.length > 0) {
      kv.set(cookieJars[0]?.id ?? null);
    }
  }, [activeCookieJar, cookieJars, kv]);

  return {
    activeCookieJar: activeCookieJar ?? null,
    setActiveCookieJarId: kv.set,
  };
}
