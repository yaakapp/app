import { useMutation } from '@tanstack/react-query';
import type { CookieJar } from '../lib/models';
import { getCookieJar } from '../lib/store';
import { invokeCmd } from '../lib/tauri';

export function useUpdateCookieJar(id: string | null) {
  return useMutation<void, unknown, Partial<CookieJar> | ((j: CookieJar) => CookieJar)>({
    mutationKey: ['update_cookie_jar', id],
    mutationFn: async (v) => {
      const cookieJar = await getCookieJar(id);
      if (cookieJar == null) {
        throw new Error("Can't update a null workspace");
      }

      const newCookieJar = typeof v === 'function' ? v(cookieJar) : { ...cookieJar, ...v };
      await invokeCmd('cmd_update_cookie_jar', { cookieJar: newCookieJar });
    },
  });
}
