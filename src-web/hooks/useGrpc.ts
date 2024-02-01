import { useMutation, useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api';
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
  useListenToTauriEvent<string>(
    'grpc_message',
    (event) => {
      console.log('GOT MESSAGE', event);
      setMessages((prev) => [
        ...prev,
        {
          message: JSON.stringify({
            dummy: 'Yo, this is a dummy message',
            another: 'property',
            list: [1, 2, 3, 4, 5],
            null: null,
            bool: true,
          }),
          time: new Date(),
          isServer: false,
        },
        { message: event.payload, time: new Date(), isServer: true },
      ]);
    },
    [],
  );
  const unary = useMutation<string, string, { service: string; method: string; message: string }>({
    mutationKey: ['grpc_unary', url],
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

  const serverStreaming = useMutation<
    string,
    string,
    { service: string; method: string; message: string }
  >({
    mutationKey: ['grpc_server_streaming', url],
    mutationFn: async ({ service, method, message }) => {
      if (url === null) throw new Error('No URL provided');
      return (await invoke('grpc_server_streaming', {
        endpoint: url,
        service,
        method,
        message,
      })) as string;
    },
  });

  const reflect = useQuery<ReflectResponseService[]>({
    queryKey: ['grpc_reflect', url ?? ''],
    queryFn: async () => {
      if (url === null) return [];
      console.log('GETTING SCHEMA', url);
      return (await invoke('grpc_reflect', { endpoint: url })) as ReflectResponseService[];
    },
  });

  return {
    unary,
    serverStreaming,
    schema: reflect.data,
    messages,
  };
}
