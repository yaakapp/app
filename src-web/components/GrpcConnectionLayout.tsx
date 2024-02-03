import useResizeObserver from '@react-hook/resize-observer';
import classNames from 'classnames';
import { format } from 'date-fns';
import type { CSSProperties, FormEvent } from 'react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useAlert } from '../hooks/useAlert';
import type { GrpcMessage } from '../hooks/useGrpc';
import { useGrpc } from '../hooks/useGrpc';
import { useUpdateGrpcRequest } from '../hooks/useUpdateGrpcRequest';
import { Banner } from './core/Banner';
import { Button } from './core/Button';
import { Editor } from './core/Editor';
import { HotKeyList } from './core/HotKeyList';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { JsonAttributeTree } from './core/JsonAttributeTree';
import { RadioDropdown } from './core/RadioDropdown';
import { Separator } from './core/Separator';
import { SplitLayout } from './core/SplitLayout';
import { HStack, VStack } from './core/Stacks';
import { GrpcEditor } from './GrpcEditor';
import { UrlBar } from './UrlBar';

interface Props {
  style: CSSProperties;
}

export function GrpcConnectionLayout({ style }: Props) {
  const activeRequest = useActiveRequest('grpc_request');
  const updateRequest = useUpdateGrpcRequest(activeRequest?.id ?? null);
  const alert = useAlert();
  const [activeMessage, setActiveMessage] = useState<GrpcMessage | null>(null);
  const [resp, setResp] = useState<string>('');
  const grpc = useGrpc(activeRequest?.url ?? null, activeRequest?.id ?? null);

  const activeMethod = useMemo(() => {
    if (grpc.services == null || activeRequest == null) return null;

    const s = grpc.services.find((s) => s.name === activeRequest.service);
    if (s == null) return null;
    return s.methods.find((m) => m.name === activeRequest.method);
  }, [activeRequest, grpc.services]);

  const handleCancel = useCallback(() => {
    grpc.cancel.mutateAsync().catch(console.error);
  }, [grpc.cancel]);

  const handleConnect = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (activeMethod == null || activeRequest == null) return;

      if (activeRequest.service == null || activeRequest.method == null) {
        alert({
          id: 'grpc-invalid-service-method',
          title: 'Error',
          body: 'Service or method not selected',
        });
      }
      if (activeMethod.clientStreaming && activeMethod.serverStreaming) {
        await grpc.bidiStreaming.mutateAsync(activeRequest);
      } else if (activeMethod.serverStreaming && !activeMethod.clientStreaming) {
        await grpc.serverStreaming.mutateAsync(activeRequest);
      } else {
        setResp(await grpc.unary.mutateAsync(activeRequest));
      }
    },
    [activeMethod, activeRequest, alert, grpc.bidiStreaming, grpc.serverStreaming, grpc.unary],
  );

  useEffect(() => {
    if (grpc.services == null || activeRequest == null) return;
    const s = grpc.services.find((s) => s.name === activeRequest.service);
    if (s == null) {
      updateRequest.mutate({
        service: grpc.services[0]?.name ?? null,
        method: grpc.services[0]?.methods[0]?.name ?? null,
      });
      return;
    }

    const m = s.methods.find((m) => m.name === activeRequest.method);
    if (m == null) {
      updateRequest.mutate({ method: s.methods[0]?.name ?? null });
      return;
    }
  }, [activeRequest, grpc.services, updateRequest]);

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

  const handleChangeUrl = useCallback(
    (url: string) => updateRequest.mutateAsync({ url }),
    [updateRequest],
  );

  const handleChangeMessage = useCallback(
    (message: string) => updateRequest.mutateAsync({ message }),
    [updateRequest],
  );

  const select = useMemo(() => {
    const options =
      grpc.services?.flatMap((s) =>
        s.methods.map((m) => ({
          label: `${s.name.split('.', 2).pop() ?? s.name}/${m.name}`,
          value: `${s.name}/${m.name}`,
        })),
      ) ?? [];
    const value = `${activeRequest?.service ?? ''}/${activeRequest?.method ?? ''}`;
    return { value, options };
  }, [activeRequest?.method, activeRequest?.service, grpc.services]);

  const [paneSize, setPaneSize] = useState(99999);
  const urlContainerEl = useRef<HTMLDivElement>(null);
  useResizeObserver<HTMLDivElement>(urlContainerEl.current, (entry) => {
    setPaneSize(entry.contentRect.width);
  });

  if (activeRequest == null) {
    return;
  }

  return (
    <SplitLayout
      name="grpc_layout"
      className="p-3 gap-1.5"
      style={style}
      leftSlot={() => (
        <VStack space={2}>
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
              isLoading={grpc.unary.isLoading}
              onUrlChange={handleChangeUrl}
            />
            <HStack space={1.5}>
              <RadioDropdown
                value={select.value}
                items={select.options.map((o) => ({
                  label: o.label,
                  value: o.value,
                  type: 'default',
                  shortLabel: o.label,
                }))}
                onChange={handleChangeService}
              >
                <Button
                  size="sm"
                  className={classNames(
                    'border border-highlight font-mono text-xs text-gray-800',
                    paneSize < 400 && 'flex-1',
                  )}
                  rightSlot={<Icon className="text-gray-600" size="sm" icon="chevronDown" />}
                >
                  {select.options.find((o) => o.value === select.value)?.label}
                </Button>
              </RadioDropdown>
              <IconButton
                className="border border-highlight"
                size="sm"
                title="to-do"
                hotkeyAction={grpc.isStreaming ? undefined : 'http_request.send'}
                onClick={grpc.isStreaming ? handleCancel : handleConnect}
                icon={
                  grpc.isStreaming
                    ? 'x'
                    : !activeMethod?.clientStreaming && activeMethod?.serverStreaming
                    ? 'arrowDownToDot'
                    : activeMethod?.clientStreaming && !activeMethod?.serverStreaming
                    ? 'arrowUpFromDot'
                    : activeMethod?.clientStreaming && activeMethod?.serverStreaming
                    ? 'arrowUpDown'
                    : 'sendHorizontal'
                }
              />
              {activeMethod?.clientStreaming && grpc.isStreaming && (
                <IconButton
                  className="border border-highlight"
                  size="sm"
                  title="to-do"
                  hotkeyAction="grpc_request.send"
                  onClick={() => grpc.send.mutateAsync({ message: activeRequest.message ?? '' })}
                  icon="sendHorizontal"
                />
              )}
            </HStack>
          </div>
          <GrpcEditor
            forceUpdateKey={activeRequest?.id ?? ''}
            url={activeRequest.url ?? ''}
            defaultValue={activeRequest.message}
            onChange={handleChangeMessage}
            service={activeRequest.service}
            method={activeRequest.method}
            className="bg-gray-50"
          />
        </VStack>
      )}
      rightSlot={() =>
        !grpc.unary.isLoading && (
          <div
            className={classNames(
              'max-h-full h-full grid grid-rows-[minmax(0,1fr)] grid-cols-1',
              'bg-gray-50 dark:bg-gray-100 rounded-md border border-highlight',
              'shadow shadow-gray-100 dark:shadow-gray-0 relative pt-1',
            )}
          >
            {grpc.unary.error ? (
              <Banner color="danger" className="m-2">
                {grpc.unary.error}
              </Banner>
            ) : (grpc.messages.value ?? []).length > 0 ? (
              <SplitLayout
                name="grpc_messages2"
                minHeightPx={20}
                defaultRatio={0.25}
                leftSlot={() => (
                  <div className="overflow-y-auto">
                    {...(grpc.messages.value ?? []).map((m, i) => (
                      <HStack
                        key={`${m.timestamp}::${m.message}::${i}`}
                        space={2}
                        onClick={() => {
                          if (m === activeMessage) setActiveMessage(null);
                          else setActiveMessage(m);
                        }}
                        alignItems="center"
                        className={classNames(
                          'px-2 py-1 font-mono',
                          m === activeMessage && 'bg-highlight',
                        )}
                      >
                        <Icon
                          className={
                            m.type === 'server'
                              ? 'text-blue-600'
                              : m.type === 'client'
                              ? 'text-green-600'
                              : 'text-gray-600'
                          }
                          icon={
                            m.type === 'server'
                              ? 'arrowBigDownDash'
                              : m.type === 'client'
                              ? 'arrowBigUpDash'
                              : 'info'
                          }
                        />
                        <div className="w-full truncate text-gray-800 text-2xs">{m.message}</div>
                        <div className="text-gray-600 text-2xs">
                          {format(m.timestamp, 'HH:mm:ss')}
                        </div>
                      </HStack>
                    ))}
                  </div>
                )}
                rightSlot={
                  !activeMessage
                    ? null
                    : () => (
                        <div className="grid grid-rows-[auto_minmax(0,1fr)]">
                          <div className="pb-3 px-2">
                            <Separator />
                          </div>
                          <div className="pl-2 overflow-y-auto">
                            <JsonAttributeTree
                              attrValue={JSON.parse(activeMessage?.message ?? '{}')}
                            />
                          </div>
                        </div>
                      )
                }
              />
            ) : resp ? (
              <Editor
                className="bg-gray-50 dark:bg-gray-100"
                contentType="application/json"
                defaultValue={resp}
                readOnly
                forceUpdateKey={resp}
              />
            ) : (
              <HotKeyList hotkeys={['grpc_request.send', 'sidebar.toggle', 'urlBar.focus']} />
            )}
          </div>
        )
      }
    />
  );
}
