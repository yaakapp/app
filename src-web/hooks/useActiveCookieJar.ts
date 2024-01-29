import { useEffect } from 'react';
import { NAMESPACE_GLOBAL } from '../lib/keyValueStore';
import { useActiveWorkspaceId } from './useActiveWorkspaceId';
import { useCookieJars } from './useCookieJars';
import { useKeyValue } from './useKeyValue';

export function useActiveCookieJar() {
  const workspaceId = useActiveWorkspaceId();
  const cookieJars = useCookieJars();

  const kv = useKeyValue<string | null>({
    namespace: NAMESPACE_GLOBAL,
    key: ['activeCookieJar', workspaceId ?? 'n/a'],
    defaultValue: null,
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
