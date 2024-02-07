import classNames from 'classnames';
import { format } from 'date-fns';
import type { CSSProperties } from 'react';
import React, { useMemo, useState } from 'react';
import { useGrpcConnections } from '../hooks/useGrpcConnections';
import { useGrpcMessages } from '../hooks/useGrpcMessages';
import type { GrpcRequest } from '../lib/models';
import { Icon } from './core/Icon';
import { JsonAttributeTree } from './core/JsonAttributeTree';
import { Separator } from './core/Separator';
import { SplitLayout } from './core/SplitLayout';
import { HStack } from './core/Stacks';
import { RecentConnectionsDropdown } from './RecentConnectionsDropdown';

interface Props {
  style?: CSSProperties;
  className?: string;
  activeRequest: GrpcRequest;
  methodType:
    | 'unary'
    | 'client_streaming'
    | 'server_streaming'
    | 'streaming'
    | 'no-schema'
    | 'no-method';
}

export function GrpcConnectionMessagesPane({ style, methodType, activeRequest }: Props) {
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const connections = useGrpcConnections(activeRequest.id ?? null);
  const activeConnection = connections[0] ?? null;
  const messages = useGrpcMessages(activeConnection?.id ?? null);

  const activeMessage = useMemo(
    () => messages.find((m) => m.id === activeMessageId) ?? null,
    [activeMessageId, messages],
  );

  return (
    <SplitLayout
      forceVertical
      style={style}
      name={methodType === 'unary' ? 'grpc_messages_unary' : 'grpc_messages_streaming'}
      defaultRatio={methodType === 'unary' ? 0.75 : 0.3}
      minHeightPx={20}
      firstSlot={() => (
        <div className="w-full grid grid-rows-[auto_minmax(0,1fr)] items-center">
          <HStack className="pl-3 mb-1 font-mono" alignItems="center">
            <HStack alignItems="center" space={2}>
              <span>{messages.filter((m) => !m.isInfo).length} messages</span>
              {activeConnection?.elapsed === 0 && (
                <Icon icon="refresh" size="sm" spin className="text-gray-600" />
              )}
            </HStack>
            {activeConnection && (
              <RecentConnectionsDropdown
                connections={connections}
                activeConnection={activeConnection}
                onPinned={() => {
                  // todo
                }}
              />
            )}
          </HStack>
          <div className="overflow-y-auto h-full">
            {...messages.map((m) => (
              <HStack
                role="button"
                key={m.id}
                space={2}
                onClick={() => {
                  if (m.id === activeMessageId) setActiveMessageId(null);
                  else setActiveMessageId(m.id);
                }}
                alignItems="center"
                className={classNames(
                  'px-2 py-1 font-mono cursor-default group',
                  m === activeMessage && '!bg-highlight',
                )}
              >
                <Icon
                  className={
                    m.isInfo ? 'text-gray-600' : m.isServer ? 'text-blue-600' : 'text-green-600'
                  }
                  icon={m.isInfo ? 'info' : m.isServer ? 'arrowBigDownDash' : 'arrowBigUpDash'}
                />
                <div
                  className={classNames(
                    'w-full truncate text-gray-800 text-2xs group-hover:text-gray-900',
                    m.id === activeMessageId && 'text-gray-900',
                  )}
                >
                  {m.message}
                </div>
                <div
                  className={classNames(
                    'text-gray-600 text-2xs group-hover:text-gray-700',
                    m.id === activeMessageId && 'text-gray-700',
                  )}
                >
                  {format(m.createdAt, 'HH:mm:ss')}
                </div>
              </HStack>
            ))}
          </div>
        </div>
      )}
      secondSlot={
        activeMessage &&
        (() => (
          <div className="grid grid-rows-[auto_minmax(0,1fr)]">
            <div className="pb-3 px-2">
              <Separator />
            </div>
            <div className="pl-2 overflow-y-auto">
              {activeMessage.isInfo ? (
                <span>{activeMessage.message}</span>
              ) : (
                <JsonAttributeTree attrValue={JSON.parse(activeMessage?.message ?? '{}')} />
              )}
            </div>
          </div>
        ))
      }
    />
  );
}
