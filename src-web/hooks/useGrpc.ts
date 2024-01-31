import { useMutation, useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';

export function useGrpc(url: string | null) {
  const callUnary = useMutation<
    string,
    unknown,
    { service: string; method: string; message: string }
  >({
    mutationKey: ['grpc_call_reflect', url],
    mutationFn: async ({ service, method, message }) => {
      if (url === null) throw new Error('No URL provided');
      return (await invoke('grpc_call_unary', {
        endpoint: url,
        service,
        method,
        message,
      })) as string;
    },
  });

  const reflect = useQuery<string | null>({
    queryKey: ['grpc_reflect', url ?? ''],
    queryFn: async () => {
      if (url === null) return null;
      console.log('GETTING SCHEMA', url);
      return (await invoke('grpc_reflect', { endpoint: url })) as string;
    },
  });

  return {
    callUnary,
    schema: reflect.data,
  };
}
