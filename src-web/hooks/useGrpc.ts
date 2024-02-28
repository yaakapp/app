import { useMutation, useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { emit } from '@tauri-apps/api/event';
import { trackEvent } from '../lib/analytics';
import { minPromiseMillis } from '../lib/minPromiseMillis';
import type { GrpcConnection, GrpcRequest } from '../lib/models';
import { useActiveEnvironmentId } from './useActiveEnvironmentId';
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
  const environmentId = useActiveEnvironmentId();

  const go = useMutation<void, string>({
    mutationFn: async () => await invoke('cmd_grpc_go', { requestId, environmentId, protoFiles }),
    onSettled: () => trackEvent('grpc_request', 'send'),
  });

  const send = useMutation({
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

  const debouncedUrl = useDebouncedValue<string>(req?.url ?? 'n/a', 500);
  const reflect = useQuery<ReflectResponseService[], string>({
    enabled: req != null,
    queryKey: ['grpc_reflect', req?.id ?? 'n/a', debouncedUrl],
    refetchOnWindowFocus: false,
    queryFn: async () => {
      return (await minPromiseMillis(
        invoke('cmd_grpc_reflect', { requestId, protoFiles }),
        300,
      )) as ReflectResponseService[];
    },
  });

  return {
    go,
    reflect,
    cancel,
    commit,
    isStreaming: conn?.elapsed === 0,
    send,
  };
}
