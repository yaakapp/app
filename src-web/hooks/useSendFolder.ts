import { useMutation } from '@tanstack/react-query';
import { useSendAnyRequest } from './useSendAnyRequest';

export function useSendManyRequests() {
  const sendAnyRequest = useSendAnyRequest();
  return useMutation<void, string, string[]>({
    mutationFn: async (requestIds: string[]) => {
      for (const id of requestIds) {
        sendAnyRequest.mutate(id);
      }
    },
  });
}
