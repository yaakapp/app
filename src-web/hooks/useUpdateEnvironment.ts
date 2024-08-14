import { useMutation } from '@tanstack/react-query';
import type { Environment } from '@yaakapp/api';
import { getEnvironment } from '../lib/store';
import { invokeCmd } from '../lib/tauri';

export function useUpdateEnvironment(id: string | null) {
  return useMutation<void, unknown, Partial<Environment> | ((r: Environment) => Environment)>({
    mutationKey: ['update_environment', id],
    mutationFn: async (v) => {
      const environment = await getEnvironment(id);
      if (environment == null) {
        throw new Error("Can't update a null environment");
      }

      const newEnvironment = typeof v === 'function' ? v(environment) : { ...environment, ...v };
      await invokeCmd('cmd_update_environment', { environment: newEnvironment });
    },
  });
}
