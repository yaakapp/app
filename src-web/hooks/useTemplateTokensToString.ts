import { useQuery } from '@tanstack/react-query';
import type { Tokens } from '../gen/Tokens';
import { invokeCmd } from '../lib/tauri';

export function useTemplateTokensToString(tokens: Tokens) {
  return useQuery<string>({
    placeholderData: (prev) => prev, // Keep previous data on refetch
    queryKey: ['template_tokens_to_string', tokens],
    queryFn: () => invokeCmd('cmd_template_tokens_to_string', { tokens }),
  });
}
