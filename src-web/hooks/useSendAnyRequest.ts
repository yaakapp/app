import { useMutation } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { save } from '@tauri-apps/api/dialog';
import slugify from 'slugify';
import { trackEvent } from '../lib/analytics';
import type { HttpResponse } from '../lib/models';
import { getRequest } from '../lib/store';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
import { useAlert } from './useAlert';
import { useCookieJars } from './useCookieJars';

export function useSendAnyRequest(options: { download?: boolean } = {}) {
  const environmentId = useActiveEnvironmentId();
  const alert = useAlert();
  const cookieJars = useCookieJars();
  return useMutation<HttpResponse | null, string, string | null>({
    mutationFn: async (id) => {
      const request = await getRequest(id);
      if (request == null) {
        return null;
      }

      let downloadDir: string | null = null;
      if (options.download) {
        downloadDir = await save({
          title: 'Select Download Destination',
          defaultPath: slugify(request.name, { lower: true, trim: true, strict: true }),
        });
        if (downloadDir == null) {
          return null;
        }
      }

      return invoke('send_request', {
        requestId: id,
        environmentId,
        downloadDir: downloadDir,
        cookieJarId: cookieJars[0]?.id,
      });
    },
    onSettled: () => trackEvent('HttpRequest', 'Send'),
    onError: (err) => alert({ title: 'Export Failed', body: err }),
  });
}
