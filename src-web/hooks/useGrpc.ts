import { useMutation, useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import type { UnlistenFn } from '@tauri-apps/api/event';
import { emit, listen } from '@tauri-apps/api/event';
import { useEffect, useRef, useState } from 'react';
import { tryFormatJson } from '../lib/formatters';
import { useKeyValue } from './useKeyValue';

interface ReflectResponseService {
  name: string;
  methods: { name: string; schema: string; serverStreaming: boolean; clientStreaming: boolean }[];
}

export interface GrpcMessage {
  message: string;
  timestamp: string;
  type: 'server' | 'client' | 'info';
}

export function useGrpc(url: string | null, requestId: string | null) {
  const messages = useKeyValue<GrpcMessage[]>({
    namespace: 'debug',
    key: ['grpc_msgs', requestId ?? 'n/a'],
    defaultValue: [],
  });
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  const unlisten = useRef<UnlistenFn | null>(null);

  useEffect(() => {
    setActiveConnectionId(null);
    unlisten.current?.();
  }, [requestId]);

  const unary = useMutation<string, string, { service: string; method: string; message: string }>({
    mutationKey: ['grpc_unary', url],
    mutationFn: async ({ service, method, message }) => {
      if (url === null) throw new Error('No URL provided');
      return (await invoke('cmd_grpc_call_unary', {
        endpoint: url,
        service,
        method,
        message,
      })) as string;
    },
  });

  const serverStreaming = useMutation<
    void,
    string,
    { service: string; method: string; message: string }
  >({
    mutationKey: ['grpc_server_streaming', url],
    mutationFn: async ({ service, method, message }) => {
      if (url === null) throw new Error('No URL provided');
      await messages.set([
        {
          type: 'client',
          message: JSON.stringify(JSON.parse(message)),
          timestamp: new Date().toISOString(),
        },
      ]);
      const id: string = await invoke('cmd_grpc_server_streaming', {
        endpoint: url,
        service,
        method,
        message,
      });
      unlisten.current = await listen(`grpc_server_msg_${id}`, async (event) => {
        await messages.set((prev) => [
          ...prev,
          {
            message: tryFormatJson(event.payload as string, false),
            timestamp: new Date().toISOString(),
            type: 'server',
          },
        ]);
      });
      setActiveConnectionId(id);
    },
  });

  const bidiStreaming = useMutation<
    void,
    string,
    { service: string; method: string; message: string }
  >({
    mutationKey: ['grpc_bidi_streaming', url],
    mutationFn: async ({ service, method, message }) => {
      if (url === null) throw new Error('No URL provided');
      const id: string = await invoke('cmd_grpc_bidi_streaming', {
        endpoint: url,
        service,
        method,
        message,
      });
      messages.set([
        { type: 'info', message: `Started connection ${id}`, timestamp: new Date().toISOString() },
      ]);
      setActiveConnectionId(id);
      unlisten.current = await listen(`grpc_server_msg_${id}`, (event) => {
        messages.set((prev) => [
          ...prev,
          {
            message: tryFormatJson(event.payload as string, false),
            timestamp: new Date().toISOString(),
            type: 'server',
          },
        ]);
      });
    },
  });

  const send = useMutation({
    mutationKey: ['grpc_send', url],
    mutationFn: async ({ message }: { message: string }) => {
      if (activeConnectionId == null) throw new Error('No active connection');
      await messages.set((m) => {
        return [...m, { type: 'client', message, timestamp: new Date().toISOString() }];
      });
      await emit(`grpc_client_msg_${activeConnectionId}`, { Message: message });
    },
  });

  const cancel = useMutation({
    mutationKey: ['grpc_cancel', url],
    mutationFn: async () => {
      setActiveConnectionId(null);
      unlisten.current?.();
      await emit('grpc_message_in', 'Cancel');
      await messages.set((m) => [
        ...m,
        { type: 'info', message: 'Cancelled by client', timestamp: new Date().toISOString() },
      ]);
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
    messages,
    isStreaming: activeConnectionId !== null,
    send,
  };
}
