import { useMutation } from '@tanstack/react-query';
import type { HttpUrlParameter } from '@yaakapp/api';
import { useToast } from '../components/ToastContext';
import { getHttpRequest } from '../lib/store';
import { useRequestEditor } from './useRequestEditor';
import { useUpdateAnyHttpRequest } from './useUpdateAnyHttpRequest';

export function useParseQuerystring(requestId: string) {
  const updateRequest = useUpdateAnyHttpRequest();
  const toast = useToast();
  const [, { focusParamsTab, forceParamsRefresh, forceUrlRefresh }] = useRequestEditor();

  return useMutation({
    mutationKey: ['parse_query_string'],
    mutationFn: async (url: string) => {
      const [baseUrl, querystring] = url.split('?');
      if (!querystring) return;

      const request = await getHttpRequest(requestId);
      if (request == null) return;

      const parsedParams = Array.from(new URLSearchParams(querystring).entries());
      const additionalUrlParameters: HttpUrlParameter[] = parsedParams.map(
        ([name, value]): HttpUrlParameter => ({
          name,
          value,
          enabled: true,
        }),
      );

      const urlParameters: HttpUrlParameter[] = [...request.urlParameters];
      for (const newParam of additionalUrlParameters) {
        const index = urlParameters.findIndex((p) => p.name === newParam.name);
        if (index >= 0) {
          urlParameters[index]!.value = newParam.value;
        } else {
          urlParameters.push(newParam);
        }
      }

      await updateRequest.mutateAsync({
        id: requestId,
        update: {
          url: baseUrl ?? request.url,
          urlParameters,
        },
      });

      toast.show({
        id: 'querystring-imported',
        variant: 'info',
        message: 'Imported query params from URL',
      });

      focusParamsTab();
      forceUrlRefresh();
      forceParamsRefresh();
    },
  });
}
