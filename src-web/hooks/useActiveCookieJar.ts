import { useMemo } from 'react';
import { useActiveCookieJarId } from './useActiveCookieJarId';
import { useCookieJars } from './useCookieJars';

export function useActiveCookieJar() {
  const [activeCookieJarId, setActiveCookieJarId] = useActiveCookieJarId();
  const cookieJars = useCookieJars();

  const activeCookieJar = useMemo(
    () => cookieJars.find((cookieJar) => cookieJar.id === activeCookieJarId),
    [activeCookieJarId, cookieJars],
  );

  return [activeCookieJar ?? null, setActiveCookieJarId] as const;
}
