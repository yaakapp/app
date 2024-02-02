import { useMutation, useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
import { emit } from '@tauri-apps/api/event';
import { useState } from 'react';
import { useListenToTauriEvent } from './useListenToTauriEvent';

interface ReflectResponseService {
  name: string;
  methods: { name: string; schema: string; serverStreaming: boolean; clientStreaming: boolean }[];
}

export interface GrpcMessage {
  message: string;
  time: Date;
  isServer: boolean;
}

export function useGrpc(url: string | null) {
  const [messages, setMessages] = useState<GrpcMessage[]>([]);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);
  useListenToTauriEvent<string>(
    'grpc_message',
    (event) => {
      setMessages((prev) => [
        ...prev,
        { message: event.payload, time: new Date(), isServer: true },
      ]);
    },
    [],
  );
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
      setMessages([
        { isServer: false, message: JSON.stringify(JSON.parse(message)), time: new Date() },
      ]);
      const id: string = await invoke('cmd_grpc_server_streaming', {
        endpoint: url,
        service,
        method,
        message,
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
      setMessages([]);
      const id: string = await invoke('cmd_grpc_bidi_streaming', {
        endpoint: url,
        service,
        method,
        message,
      });
      setActiveConnectionId(id);
    },
  });

  const cancel = useMutation({
    mutationKey: ['grpc_cancel', url],
    mutationFn: async () => {
      await emit('grpc_message_in', 'Cancel');
      setActiveConnectionId(null);
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
    schema: reflect.data,
    cancel,
    messages,
  };
}
