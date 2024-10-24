import { useQuery } from '@tanstack/react-query';
import type { GetTemplateFunctionsResponse } from '@yaakapp-internal/plugin';
import { invokeCmd } from '../lib/tauri';
import { usePluginsKey } from './usePlugins';

export function useTemplateFunctions() {
  const pluginsKey = usePluginsKey();

  const result = useQuery({
    queryKey: ['template_functions', pluginsKey],
    // NOTE: visibilitychange (refetchOnWindowFocus) does not work on Windows, so we'll rely on mount to
    //  refetch template functions for us when. This should handle the case where the plugin system isn't
    //  quite ready the first time this is invoked.
    refetchOnMount: true,
    queryFn: async () => {
      return invokeCmd<GetTemplateFunctionsResponse[]>('cmd_template_functions');
    },
  });

  return result.data?.flatMap((r) => r.functions) ?? [];
}
