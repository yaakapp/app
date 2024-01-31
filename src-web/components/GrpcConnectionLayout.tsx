import type { Props } from 'focus-trap-react';
import type { CSSProperties, FormEvent } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { useGrpc } from '../hooks/useGrpc';
import { useKeyValue } from '../hooks/useKeyValue';
import { Editor } from './core/Editor';
import { SplitLayout } from './core/SplitLayout';
import { VStack } from './core/Stacks';
import { GrpcEditor } from './GrpcEditor';
import { UrlBar } from './UrlBar';

interface Props {
  style: CSSProperties;
}

export function GrpcConnectionLayout({ style }: Props) {
  const url = useKeyValue<string>({ namespace: 'debug', key: 'grpc_url', defaultValue: '' });
  const message = useKeyValue<string>({
    namespace: 'debug',
    key: 'grpc_message',
    defaultValue: '',
  });
  const [resp, setResp] = useState<string>('');
  const grpc = useGrpc(url.value ?? null);
  const handleConnect = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setResp(
        await grpc.callUnary.mutateAsync({
          service: 'helloworld.Greeter',
          method: 'SayHello',
          message: message.value ?? '',
        }),
      );
    },
    [grpc.callUnary, message.value],
  );

  useEffect(() => {
    console.log('REFLECT SCHEMA', grpc.schema);
  }, [grpc.schema]);

  if (url.isLoading || url.value == null) {
    return null;
  }

  return (
    <SplitLayout
      style={style}
      leftSlot={() => (
        <VStack space={2}>
          <UrlBar
            id="foo"
            url={url.value ?? ''}
            method={null}
            placeholder="localhost:50051"
            onSubmit={handleConnect}
            isLoading={false}
            onUrlChange={url.set}
            forceUpdateKey={''}
          />
          <GrpcEditor
            url={url.value ?? ''}
            defaultValue={message.value}
            onChange={message.set}
            className="bg-gray-50"
          />
        </VStack>
      )}
      rightSlot={() => (
        <Editor
          className="bg-gray-50 border border-highlight"
          contentType="application/json"
          defaultValue={resp}
          readOnly
          forceUpdateKey={resp}
        />
      )}
    />
  );
}
