import classNames from 'classnames';
import type { CSSProperties, FormEvent } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAlert } from '../hooks/useAlert';
import { useGrpc } from '../hooks/useGrpc';
import { useKeyValue } from '../hooks/useKeyValue';
import { Banner } from './core/Banner';
import { Editor } from './core/Editor';
import { HotKeyList } from './core/HotKeyList';
import { Icon } from './core/Icon';
import { Select } from './core/Select';
import { SplitLayout } from './core/SplitLayout';
import { HStack, VStack } from './core/Stacks';
import { GrpcEditor } from './GrpcEditor';
import { UrlBar } from './UrlBar';
import { format } from 'date-fns';

interface Props {
  style: CSSProperties;
}

export function GrpcConnectionLayout({ style }: Props) {
  const url = useKeyValue<string>({ namespace: 'debug', key: 'grpc_url', defaultValue: '' });
  const alert = useAlert();
  const service = useKeyValue<string | null>({
    namespace: 'debug',
    key: 'grpc_service',
    defaultValue: null,
  });
  const method = useKeyValue<string | null>({
    namespace: 'debug',
    key: 'grpc_method',
    defaultValue: null,
  });
  const message = useKeyValue<string>({
    namespace: 'debug',
    key: 'grpc_message',
    defaultValue: '',
  });
  const [resp, setResp] = useState<string>('');
  const grpc = useGrpc(url.value ?? null);

  const activeMethod = useMemo(() => {
    if (grpc.schema == null) return null;
    const s = grpc.schema.find((s) => s.name === service.value);
    if (s == null) return null;
    return s.methods.find((m) => m.name === method.value);
  }, [grpc.schema, method.value, service.value]);

  const handleConnect = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (activeMethod == null) return;

      if (service.value == null || method.value == null) {
        alert({
          id: 'grpc-invalid-service-method',
          title: 'Error',
          body: 'Service or method not selected',
        });
      }
      if (activeMethod.serverStreaming && !activeMethod.clientStreaming) {
        await grpc.serverStreaming.mutateAsync({
          service: service.value ?? 'n/a',
          method: method.value ?? 'n/a',
          message: message.value ?? '',
        });
      } else {
        setResp(
          await grpc.unary.mutateAsync({
            service: service.value ?? 'n/a',
            method: method.value ?? 'n/a',
            message: message.value ?? '',
          }),
        );
      }
    },
    [
      activeMethod,
      alert,
      grpc.serverStreaming,
      grpc.unary,
      message.value,
      method.value,
      service.value,
    ],
  );

  useEffect(() => {
    if (grpc.schema == null) return;
    const s = grpc.schema.find((s) => s.name === service.value);
    if (s == null) {
      service.set(grpc.schema[0]?.name ?? null);
      method.set(grpc.schema[0]?.methods[0]?.name ?? null);
      return;
    }

    const m = s.methods.find((m) => m.name === method.value);
    if (m == null) {
      method.set(s.methods[0]?.name ?? null);
      return;
    }
  }, [grpc.schema, method, service]);

  const handleChangeService = useCallback(
    (v: string) => {
      const [serviceName, methodName] = v.split('/', 2);
      if (serviceName == null || methodName == null) throw new Error('Should never happen');
      method.set(methodName);
      service.set(serviceName);
    },
    [method, service],
  );

  const select = useMemo(() => {
    const options =
      grpc.schema?.flatMap((s) =>
        s.methods.map((m) => ({
          label: `${s.name.split('.', 2).pop() ?? s.name}/${m.name}`,
          value: `${s.name}/${m.name}`,
        })),
      ) ?? [];
    const value = `${service.value ?? ''}/${method.value ?? ''}`;
    return { value, options };
  }, [grpc.schema, method.value, service.value]);

  if (url.isLoading || url.value == null) {
    return null;
  }

  return (
    <SplitLayout
      style={style}
      leftSlot={() => (
        <VStack space={2}>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-1.5">
            <UrlBar
              id="foo"
              url={url.value ?? ''}
              method={null}
              forceUpdateKey="to-do"
              placeholder="localhost:50051"
              onSubmit={handleConnect}
              isLoading={grpc.unary.isLoading}
              onUrlChange={url.set}
              submitIcon={
                !activeMethod?.clientStreaming && activeMethod?.serverStreaming
                  ? 'arrowDownToDot'
                  : activeMethod?.clientStreaming && !activeMethod?.serverStreaming
                  ? 'arrowUpFromDot'
                  : activeMethod?.clientStreaming && activeMethod?.serverStreaming
                  ? 'arrowUpDown'
                  : 'sendHorizontal'
              }
            />
            <Select
              hideLabel
              name="service"
              label="Service"
              size="sm"
              value={select.value}
              onChange={handleChangeService}
              options={select.options}
            />
          </div>
          <GrpcEditor
            forceUpdateKey={[service, method].join('::')}
            url={url.value ?? ''}
            defaultValue={message.value}
            onChange={message.set}
            service={service.value ?? null}
            method={method.value ?? null}
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
              'shadow shadow-gray-100 dark:shadow-gray-0 relative py-1',
            )}
          >
            {grpc.unary.error ? (
              <Banner color="danger" className="m-2">
                {grpc.unary.error}
              </Banner>
            ) : grpc.messages.length > 0 ? (
              <VStack className="h-full overflow-y-auto">
                {[...grpc.messages].reverse().map((m, i) => (
                  <HStack key={m.time.getTime()} space={3} className="px-2 py-1 font-mono text-xs">
                    <Icon icon="arrowDownToDot" />
                    <div>{format(m.time, 'HH:mm:ss')}</div>
                    <div>{m.message}</div>
                  </HStack>
                ))}
              </VStack>
            ) : resp ? (
              <Editor
                className="bg-gray-50 dark:bg-gray-100"
                contentType="application/json"
                defaultValue={resp}
                readOnly
                forceUpdateKey={resp}
              />
            ) : (
              <HotKeyList hotkeys={['grpc.send', 'sidebar.toggle', 'urlBar.focus']} />
            )}
          </div>
        )
      }
    />
  );
}
