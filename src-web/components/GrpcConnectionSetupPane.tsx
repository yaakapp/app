import useResizeObserver from '@react-hook/resize-observer';
import classNames from 'classnames';
import type { CSSProperties, FormEvent } from 'react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { ReflectResponseService } from '../hooks/useGrpc';
import { useGrpcConnections } from '../hooks/useGrpcConnections';
import { useUpdateGrpcRequest } from '../hooks/useUpdateGrpcRequest';
import type { GrpcRequest } from '../lib/models';
import { Button } from './core/Button';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { RadioDropdown } from './core/RadioDropdown';
import { HStack, VStack } from './core/Stacks';
import { GrpcEditor } from './GrpcEditor';
import { UrlBar } from './UrlBar';

interface Props {
  style?: CSSProperties;
  className?: string;
  activeRequest: GrpcRequest;
  reflectionError?: string;
  reflectionLoading?: boolean;
  methodType:
    | 'unary'
    | 'client_streaming'
    | 'server_streaming'
    | 'streaming'
    | 'no-schema'
    | 'no-method';
  onUnary: () => void;
  onCommit: () => void;
  onCancel: () => void;
  onSend: (v: { message: string }) => void;
  onClientStreaming: () => void;
  onServerStreaming: () => void;
  onStreaming: () => void;
  onReflectRefetch: () => void;
  services: ReflectResponseService[] | null;
}

export function GrpcConnectionSetupPane({
  style,
  services,
  methodType,
  activeRequest,
  reflectionError,
  reflectionLoading,
  onReflectRefetch,
  onStreaming,
  onClientStreaming,
  onServerStreaming,
  onCommit,
  onCancel,
  onSend,
  onUnary,
}: Props) {
  const connections = useGrpcConnections(activeRequest.id ?? null);
  const updateRequest = useUpdateGrpcRequest(activeRequest?.id ?? null);
  const activeConnection = connections[0] ?? null;
  const isStreaming = activeConnection?.elapsed === 0;

  const [paneSize, setPaneSize] = useState(99999);
  const urlContainerEl = useRef<HTMLDivElement>(null);
  useResizeObserver<HTMLDivElement>(urlContainerEl.current, (entry) => {
    setPaneSize(entry.contentRect.width);
  });

  const handleChangeUrl = useCallback(
    (url: string) => updateRequest.mutateAsync({ url }),
    [updateRequest],
  );

  const handleChangeMessage = useCallback(
    (message: string) => updateRequest.mutateAsync({ message }),
    [updateRequest],
  );

  const handleSelectProtoFiles = useCallback(
    (paths: string[]) => updateRequest.mutateAsync({ protoFiles: paths }),
    [updateRequest],
  );

  const select = useMemo(() => {
    const options =
      services?.flatMap((s) =>
        s.methods.map((m) => ({
          label: `${s.name.split('.', 2).pop() ?? s.name}/${m.name}`,
          value: `${s.name}/${m.name}`,
        })),
      ) ?? [];
    const value = `${activeRequest?.service ?? ''}/${activeRequest?.method ?? ''}`;
    return { value, options };
  }, [activeRequest?.method, activeRequest?.service, services]);

  const handleChangeService = useCallback(
    async (v: string) => {
      const [serviceName, methodName] = v.split('/', 2);
      if (serviceName == null || methodName == null) throw new Error('Should never happen');
      await updateRequest.mutateAsync({
        service: serviceName,
        method: methodName,
      });
    },
    [updateRequest],
  );

  const handleConnect = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (activeRequest == null) return;

      if (activeRequest.service == null || activeRequest.method == null) {
        alert({
          id: 'grpc-invalid-service-method',
          title: 'Error',
          body: 'Service or method not selected',
        });
      }
      if (methodType === 'streaming') {
        onStreaming();
      } else if (methodType === 'server_streaming') {
        onServerStreaming();
      } else if (methodType === 'client_streaming') {
        onClientStreaming();
      } else {
        onUnary();
      }
    },
    [activeRequest, methodType, onStreaming, onServerStreaming, onClientStreaming, onUnary],
  );

  return (
    <VStack space={2} style={style}>
      <div
        ref={urlContainerEl}
        className={classNames(
          'grid grid-cols-[minmax(0,1fr)_auto] gap-1.5',
          paneSize < 400 && '!grid-cols-1',
        )}
      >
        <UrlBar
          url={activeRequest.url ?? ''}
          method={null}
          submitIcon={null}
          forceUpdateKey={activeRequest?.id ?? ''}
          placeholder="localhost:50051"
          onSubmit={handleConnect}
          onUrlChange={handleChangeUrl}
          isLoading={false}
        />
        <HStack space={1.5}>
          <RadioDropdown
            value={select.value}
            onChange={handleChangeService}
            items={select.options.map((o) => ({
              label: o.label,
              value: o.value,
              type: 'default',
              shortLabel: o.label,
            }))}
            extraItems={[
              {
                label: 'Custom',
                type: 'default',
                key: 'custom',
              },
            ]}
          >
            <Button
              size="sm"
              variant="border"
              rightSlot={<Icon className="text-gray-600" size="sm" icon="chevronDown" />}
              disabled={isStreaming || services == null}
              className={classNames(
                'font-mono text-xs min-w-[5rem] !ring-0',
                paneSize < 400 && 'flex-1',
              )}
            >
              {select.options.find((o) => o.value === select.value)?.label ?? 'No Schema'}
            </Button>
          </RadioDropdown>
          {!isStreaming && (
            <IconButton
              className="border border-highlight"
              size="sm"
              title={methodType === 'unary' ? 'Send' : 'Connect'}
              hotkeyAction={isStreaming ? undefined : 'http_request.send'}
              onClick={handleConnect}
              disabled={methodType === 'no-schema' || methodType === 'no-method'}
              icon={
                isStreaming
                  ? 'refresh'
                  : methodType.includes('streaming')
                  ? 'arrowUpDown'
                  : 'sendHorizontal'
              }
            />
          )}
          {isStreaming && (
            <IconButton
              className="border border-highlight"
              size="sm"
              title="Cancel"
              onClick={onCancel}
              icon="x"
              disabled={!isStreaming}
            />
          )}
          {methodType === 'client_streaming' && isStreaming && (
            <IconButton
              className="border border-highlight"
              size="sm"
              title="to-do"
              onClick={onCommit}
              icon="check"
            />
          )}
          {(methodType === 'client_streaming' || methodType === 'streaming') && isStreaming && (
            <IconButton
              className="border border-highlight"
              size="sm"
              title="to-do"
              hotkeyAction="grpc_request.send"
              onClick={() => onSend({ message: activeRequest.message ?? '' })}
              icon="sendHorizontal"
            />
          )}
        </HStack>
      </div>
      <GrpcEditor
        onChange={handleChangeMessage}
        services={services}
        className="bg-gray-50"
        reflectionError={reflectionError}
        reflectionLoading={reflectionLoading}
        onReflect={onReflectRefetch}
        onSelectProtoFiles={handleSelectProtoFiles}
        request={activeRequest}
      />
    </VStack>
  );
}
