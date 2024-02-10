import { useMutation, useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { emit } from '@tauri-apps/api/event';
import { minPromiseMillis } from '../lib/minPromiseMillis';
import type { GrpcConnection, GrpcMessage, GrpcRequest } from '../lib/models';
import { useDebouncedValue } from './useDebouncedValue';

export interface ReflectResponseService {
  name: string;
  methods: { name: string; schema: string; serverStreaming: boolean; clientStreaming: boolean }[];
}

export function useGrpc(req: GrpcRequest | null, conn: GrpcConnection | null) {
  const requestId = req?.id ?? 'n/a';

  const unary = useMutation<GrpcMessage, string>({
    mutationKey: ['grpc_unary', conn?.id ?? 'n/a'],
    mutationFn: async () =>
      (await invoke('cmd_grpc_call_unary', {
        requestId,
      })) as GrpcMessage,
  });

  const clientStreaming = useMutation<void, string>({
    mutationKey: ['grpc_client_streaming', conn?.id ?? 'n/a'],
    mutationFn: async () => await invoke('cmd_grpc_client_streaming', { requestId }),
  });

  const serverStreaming = useMutation<void, string>({
    mutationKey: ['grpc_server_streaming', conn?.id ?? 'n/a'],
    mutationFn: async () => await invoke('cmd_grpc_server_streaming', { requestId }),
  });

  const streaming = useMutation<void, string>({
    mutationKey: ['grpc_streaming', conn?.id ?? 'n/a'],
    mutationFn: async () => await invoke('cmd_grpc_streaming', { requestId }),
  });

  const send = useMutation({
    mutationFn: async ({ message }: { message: string }) =>
      await emit(`grpc_client_msg_${conn?.id ?? 'none'}`, { Message: message }),
  });

  const cancel = useMutation({
    mutationKey: ['grpc_cancel', conn?.id ?? 'n/a'],
    mutationFn: async () => await emit(`grpc_client_msg_${conn?.id ?? 'none'}`, 'Cancel'),
  });

  const commit = useMutation({
    mutationKey: ['grpc_commit', conn?.id ?? 'n/a'],
    mutationFn: async () => await emit(`grpc_client_msg_${conn?.id ?? 'none'}`, 'Commit'),
  });

  const debouncedUrl = useDebouncedValue<string>(req?.url ?? 'n/a', 1000);
  const reflect = useQuery<ReflectResponseService[] | null, string>({
    enabled: req != null,
    queryKey: ['grpc_reflect', req?.id ?? 'n/a', debouncedUrl],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      return (await minPromiseMillis(
        invoke('cmd_grpc_reflect', { requestId }),
        300,
      )) as ReflectResponseService[];
    },
  });

  return {
    unary,
    clientStreaming,
    serverStreaming,
    streaming,
    reflect,
    cancel,
    commit,
    isStreaming: conn?.elapsed === 0,
    send,
  };
}
