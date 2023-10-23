import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { Environment } from '../lib/models';
import { getEnvironment } from '../lib/store';
import { environmentsQueryKey } from './useEnvironments';

export function useUpdateEnvironment(id: string | null) {
  const queryClient = useQueryClient();
  return useMutation<void, unknown, Partial<Environment> | ((r: Environment) => Environment)>({
    mutationFn: async (v) => {
      const environment = await getEnvironment(id);
      if (environment == null) {
        throw new Error("Can't update a null environment");
      }

      const newEnvironment = typeof v === 'function' ? v(environment) : { ...environment, ...v };
      await invoke('update_environment', { environment: newEnvironment });
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
