import { useMutation, useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { UnlistenFn } from '@tauri-apps/api/event';
import { emit, listen } from '@tauri-apps/api/event';
import { useEffect, useRef, useState } from 'react';
import type { GrpcConnection, GrpcMessage, GrpcRequest } from '../lib/models';
import { useKeyValue } from './useKeyValue';

interface ReflectResponseService {
  name: string;
  methods: { name: string; schema: string; serverStreaming: boolean; clientStreaming: boolean }[];
}

export function useGrpc(url: string | null, requestId: string | null) {
  const messages = useKeyValue<GrpcMessage[]>({
    namespace: 'debug',
    key: ['grpc_msgs', requestId ?? 'n/a'],
    defaultValue: [],
  });
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);

  useEffect(() => {
    setActiveConnectionId(null);
  }, [requestId]);

  const unary = useMutation<GrpcMessage, string, string>({
    mutationKey: ['grpc_unary', url],
    mutationFn: async (id) => {
      const message = (await invoke('cmd_grpc_call_unary', {
        requestId: id,
      })) as GrpcMessage;
      await messages.set([message]);
      console.log('MESSAGE', message);
      return message;
    },
  });

  const serverStreaming = useMutation<void, string, string>({
    mutationKey: ['grpc_server_streaming', url],
    mutationFn: async (requestId) => {
      if (url === null) throw new Error('No URL provided');
      await messages.set([]);
      const c = (await invoke('cmd_grpc_server_streaming', { requestId })) as GrpcConnection;
      setActiveConnectionId(c.id);
    },
  });

  const bidiStreaming = useMutation<void, string, GrpcRequest>({
    mutationKey: ['grpc_bidi_streaming', url],
    mutationFn: async ({ service, method, message, url }) => {
      if (url === null) throw new Error('No URL provided');
      const id: string = await invoke('cmd_grpc_bidi_streaming', {
        endpoint: url,
        service,
        method,
        message,
      });
      await messages.set([]);
      setActiveConnectionId(id);
    },
  });

  const send = useMutation({
    mutationKey: ['grpc_send', url],
    mutationFn: async ({ message }: { message: string }) => {
      if (activeConnectionId == null) throw new Error('No active connection');
      await messages.set([]);
      // await messages.set((m) => {
      //   return [...m, { type: 'client', message, timestamp: new Date().toISOString() }];
      // });
      await emit(`grpc_client_msg_${activeConnectionId}`, { Message: message });
    },
  });

  const cancel = useMutation({
    mutationKey: ['grpc_cancel', url],
    mutationFn: async () => {
      setActiveConnectionId(null);
      await emit(`grpc_client_msg_${activeConnectionId}`, 'Cancel');
    },
  });

  const reflect = useQuery<ReflectResponseService[]>({
    queryKey: ['grpc_reflect', url ?? ''],
    queryFn: async () => {
      if (url === null) return [];
      return (await invoke('cmd_grpc_reflect', { endpoint: url })) as ReflectResponseService[];
    },
  });

  return {
    unary,
    serverStreaming,
    bidiStreaming,
    services: reflect.data,
    cancel,
    isStreaming: activeConnectionId !== null,
    send,
  };
}
