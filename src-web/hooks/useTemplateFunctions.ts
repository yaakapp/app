import { useQuery } from '@tanstack/react-query';
import type { GetTemplateFunctionsResponse } from '@yaakapp/api';
import { invokeCmd } from '../lib/tauri';
import { usePluginsKey } from './usePlugins';

export function useTemplateFunctions() {
  const pluginsKey = usePluginsKey();

  const result = useQuery({
    queryKey: ['template_functions', pluginsKey],
    queryFn: async () => {
      const responses = (await invokeCmd(
        'cmd_template_functions',
      )) as GetTemplateFunctionsResponse[];
      return responses;
    },
  });

  return result.data?.flatMap((r) => r.functions) ?? [];
}
