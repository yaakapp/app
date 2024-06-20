import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CookieJar } from '../lib/models';
import { getCookieJar } from '../lib/store';
import { invokeCmd } from '../lib/tauri';
import { cookieJarsQueryKey } from './useCookieJars';

export function useUpdateCookieJar(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, Partial<CookieJar> | ((j: CookieJar) => CookieJar)>({
    mutationFn: async (v) => {
      const cookieJar = await getCookieJar(id);
      if (cookieJar == null) {
        throw new Error("Can't update a null workspace");
      }

      const newCookieJar = typeof v === 'function' ? v(cookieJar) : { ...cookieJar, ...v };
      console.log('NEW COOKIE JAR', newCookieJar.cookies.length);
      await invokeCmd('cmd_update_cookie_jar', { cookieJar: newCookieJar });
    },
    onMutate: async (v) => {
      const cookieJar = await getCookieJar(id);
      if (cookieJar === null) return;

      const newCookieJar = typeof v === 'function' ? v(cookieJar) : { ...cookieJar, ...v };
      queryClient.setQueryData<CookieJar[]>(cookieJarsQueryKey(cookieJar), (cookieJars) =>
        (cookieJars ?? []).map((j) => (j.id === newCookieJar.id ? newCookieJar : j)),
      );
    },
  });
}
