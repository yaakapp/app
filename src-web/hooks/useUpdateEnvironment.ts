import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Environment } from '@yaakapp/api';
import { getEnvironment } from '../lib/store';
import { invokeCmd } from '../lib/tauri';
import { environmentsQueryKey } from './useEnvironments';

export function useUpdateEnvironment(id: string | null) {
  const queryClient = useQueryClient();
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
    onMutate: async (v) => {
      const environment = await getEnvironment(id);
      if (environment === null) return;

      const newEnvironment = typeof v === 'function' ? v(environment) : { ...environment, ...v };
      queryClient.setQueryData<Environment[]>(environmentsQueryKey(environment), (environments) =>
        (environments ?? []).map((r) => (r.id === newEnvironment.id ? newEnvironment : r)),
      );
    },
  });
}
