import { useQuery } from '@tanstack/react-query';
import { invokeCmd } from '../lib/tauri';

export function useParseTemplate(template: string) {
  return useQuery({
    queryKey: ['parse_template', template],
    queryFn: async () => {
      console.log('PARSING', template);
      const foo = await invokeCmd('cmd_parse_template', { template });
      console.log('FOO', foo);
      return foo;
    },
  });
}
