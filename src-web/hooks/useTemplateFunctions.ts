import { useQuery } from '@tanstack/react-query';
import type { GetTemplateFunctionsResponse } from '@yaakapp/api';
import { invokeCmd } from '../lib/tauri';

export function useTemplateFunctions() {
  const result = useQuery({
    queryKey: ['template_functions'],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const responses = (await invokeCmd(
        'cmd_template_functions',
      )) as GetTemplateFunctionsResponse[];
      return responses;
    },
  });

  const fns = result.data?.flatMap((r) => r.functions) ?? [];
  return fns;
}
