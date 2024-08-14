import { useMutation, useQuery } from '@tanstack/react-query';
import { emit } from '@tauri-apps/api/event';
import type { GrpcConnection, GrpcRequest } from '@yaakapp/api';
import { trackEvent } from '../lib/analytics';
import { minPromiseMillis } from '../lib/minPromiseMillis';
import { invokeCmd } from '../lib/tauri';
import { useActiveEnvironment } from './useActiveEnvironment';
import { useDebouncedValue } from './useDebouncedValue';

export interface ReflectResponseService {
  name: string;
  methods: { name: string; schema: string; serverStreaming: boolean; clientStreaming: boolean }[];
}

export function useGrpc(
  req: GrpcRequest | null,
  conn: GrpcConnection | null,
  protoFiles: string[],
) {
  const requestId = req?.id ?? 'n/a';
  const [environment] = useActiveEnvironment();

  const go = useMutation<void, string>({
    mutationKey: ['grpc_go', conn?.id],
    mutationFn: async () =>
      await invokeCmd('cmd_grpc_go', { requestId, environmentId: environment?.id, protoFiles }),
    onSettled: () => trackEvent('grpc_request', 'send'),
  });

  const send = useMutation({
    mutationKey: ['grpc_send', conn?.id],
    mutationFn: async ({ message }: { message: string }) =>
      await emit(`grpc_client_msg_${conn?.id ?? 'none'}`, { Message: message }),
    onSettled: () => trackEvent('grpc_connection', 'send'),
  });

  const cancel = useMutation({
    mutationKey: ['grpc_cancel', conn?.id ?? 'n/a'],
    mutationFn: async () => await emit(`grpc_client_msg_${conn?.id ?? 'none'}`, 'Cancel'),
    onSettled: () => trackEvent('grpc_connection', 'cancel'),
  });

  const commit = useMutation({
    mutationKey: ['grpc_commit', conn?.id ?? 'n/a'],
    mutationFn: async () => await emit(`grpc_client_msg_${conn?.id ?? 'none'}`, 'Commit'),
    onSettled: () => trackEvent('grpc_connection', 'commit'),
  });

  const debouncedUrl = useDebouncedValue<string>(req?.url ?? '', 1000);
  const debouncedMessage = useDebouncedValue<string>(req?.message ?? '', 1000);

  const reflect = useQuery<ReflectResponseService[], string>({
    enabled: req != null,
    queryKey: ['grpc_reflect', req?.id ?? 'n/a', debouncedUrl, debouncedMessage, protoFiles],
    queryFn: async () =>
      (await minPromiseMillis(
        invokeCmd('cmd_grpc_reflect', { requestId, protoFiles }),
        300,
      )) as ReflectResponseService[],
  });

  return {
    go,
    reflect,
    cancel,
    commit,
    isStreaming: conn != null && conn.elapsed === 0,
    send,
  };
}
