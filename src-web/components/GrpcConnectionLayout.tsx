import classNames from 'classnames';
import type { CSSProperties } from 'react';
import React, { useEffect, useMemo } from 'react';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useGrpc } from '../hooks/useGrpc';
import { useGrpcConnections } from '../hooks/useGrpcConnections';
import { useGrpcMessages } from '../hooks/useGrpcMessages';
import { useUpdateGrpcRequest } from '../hooks/useUpdateGrpcRequest';
import { Banner } from './core/Banner';
import { HotKeyList } from './core/HotKeyList';
import { SplitLayout } from './core/SplitLayout';
import { GrpcConnectionMessagesPane } from './GrpcConnectionMessagesPane';
import { GrpcConnectionSetupPane } from './GrpcConnectionSetupPane';

interface Props {
  style: CSSProperties;
}

export function GrpcConnectionLayout({ style }: Props) {
  const activeRequest = useActiveRequest('grpc_request');
  const updateRequest = useUpdateGrpcRequest(activeRequest?.id ?? null);
  const connections = useGrpcConnections(activeRequest?.id ?? null);
  const activeConnection = connections[0] ?? null;
  const messages = useGrpcMessages(activeConnection?.id ?? null);
  const grpc = useGrpc(activeRequest, activeConnection);

  const services = grpc.reflect.data ?? null;
  useEffect(() => {
    if (services == null || activeRequest == null) return;
    const s = services.find((s) => s.name === activeRequest.service);
    if (s == null) {
      updateRequest.mutate({
        service: services[0]?.name ?? null,
        method: services[0]?.methods[0]?.name ?? null,
      });
      return;
    }

    const m = s.methods.find((m) => m.name === activeRequest.method);
    if (m == null) {
      updateRequest.mutate({ method: s.methods[0]?.name ?? null });
      return;
    }
  }, [activeRequest, services, updateRequest]);

  const activeMethod = useMemo(() => {
    if (services == null || activeRequest == null) return null;

    const s = services.find((s) => s.name === activeRequest.service);
    if (s == null) return null;
    return s.methods.find((m) => m.name === activeRequest.method);
  }, [activeRequest, services]);

  const methodType:
    | 'unary'
    | 'server_streaming'
    | 'client_streaming'
    | 'streaming'
    | 'no-schema'
    | 'no-method' = useMemo(() => {
    if (services == null) return 'no-schema';
    if (activeMethod == null) return 'no-method';
    if (activeMethod.clientStreaming && activeMethod.serverStreaming) return 'streaming';
    if (activeMethod.clientStreaming) return 'client_streaming';
    if (activeMethod.serverStreaming) return 'server_streaming';
    return 'unary';
  }, [activeMethod, services]);

  if (activeRequest == null) {
    return null;
  }

  return (
    <SplitLayout
      name="grpc_layout"
      className="p-3 gap-1.5"
      style={style}
      firstSlot={({ style }) => (
        <GrpcConnectionSetupPane
          style={style}
          activeRequest={activeRequest}
          methodType={methodType}
          onUnary={grpc.unary.mutate}
          onServerStreaming={grpc.serverStreaming.mutate}
          onClientStreaming={grpc.clientStreaming.mutate}
          onStreaming={grpc.streaming.mutate}
          onCommit={grpc.commit.mutate}
          onCancel={grpc.cancel.mutate}
          onSend={grpc.send.mutate}
          onReflectRefetch={grpc.reflect.refetch}
          services={services ?? null}
          reflectionError={grpc.reflect.error as string | undefined}
          reflectionLoading={grpc.reflect.isFetching}
        />
      )}
      secondSlot={({ style }) =>
        !grpc.unary.isLoading && (
          <div
            style={style}
            className={classNames(
              'max-h-full h-full grid grid-rows-[minmax(0,1fr)] grid-cols-1',
              'bg-gray-50 dark:bg-gray-100 rounded-md border border-highlight',
              'shadow shadow-gray-100 dark:shadow-gray-0 relative',
            )}
          >
            {grpc.unary.error ? (
              <Banner color="danger" className="m-2">
                {grpc.unary.error}
              </Banner>
            ) : messages.length >= 0 ? (
              <GrpcConnectionMessagesPane activeRequest={activeRequest} methodType={methodType} />
            ) : (
              <HotKeyList hotkeys={['grpc_request.send', 'sidebar.toggle', 'urlBar.focus']} />
            )}
          </div>
        )
      }
    />
  );
}
