import classNames from 'classnames';
import { format, addMilliseconds } from 'date-fns';
import type { CSSProperties, ReactNode } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useGrpcConnections } from '../hooks/useGrpcConnections';
import { useGrpcEvents } from '../hooks/useGrpcEvents';
import type { GrpcEvent, GrpcRequest } from '../lib/models';
import { Icon } from './core/Icon';
import { JsonAttributeTree } from './core/JsonAttributeTree';
import { KeyValueRow, KeyValueRows } from './core/KeyValueRow';
import { Separator } from './core/Separator';
import { SplitLayout } from './core/SplitLayout';
import { HStack } from './core/Stacks';
import { EmptyStateText } from './EmptyStateText';
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

const CONNECTION_RESPONSE_EVENT_ID = 'connection_response';

export function GrpcConnectionMessagesPane({ style, methodType, activeRequest }: Props) {
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const connections = useGrpcConnections(activeRequest.id ?? null);
  const activeConnection = connections[0] ?? null;
  const ogEvents = useGrpcEvents(activeConnection?.id ?? null);

  const events = useMemo(() => {
    const createdAt =
      activeConnection != null &&
      addMilliseconds(activeConnection.createdAt, activeConnection.elapsed)
        .toISOString()
        .replace('Z', '');
    if (activeConnection == null || activeConnection.elapsed === 0) {
      return ogEvents;
    } else if (activeConnection.error != null) {
      return [
        ...ogEvents,
        {
          id: CONNECTION_RESPONSE_EVENT_ID,
          eventType: 'error',
          content: activeConnection.error,
          metadata: activeConnection.trailers,
          createdAt,
          updatedAt: createdAt,
        } as GrpcEvent,
      ];
    } else {
      return [
        ...ogEvents,
        {
          id: CONNECTION_RESPONSE_EVENT_ID,
          eventType: activeConnection.status === 0 ? 'connection_response' : 'error',
          content: `Connection ${GRPC_CODES[activeConnection.status] ?? 'closed'}`,
          metadata: activeConnection.trailers,
          createdAt,
          updatedAt: createdAt,
        } as GrpcEvent,
      ];
    }
  }, [activeConnection, ogEvents]);

  const activeEvent = useMemo(
    () => events.find((m) => m.id === activeEventId) ?? null,
    [activeEventId, events],
  );

  // Set active message to the first message received if unary
  useEffect(() => {
    if (events.length === 0 || activeEvent != null || methodType !== 'unary') {
      return;
    }
    setActiveEventId(events.find((m) => m.eventType === 'server_message')?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events.length]);

  return (
    <SplitLayout
      layout="vertical"
      style={style}
      name="grpc_events"
      defaultRatio={0.4}
      minHeightPx={20}
      firstSlot={() =>
        activeConnection && (
          <div className="w-full grid grid-rows-[auto_minmax(0,1fr)] items-center">
            <HStack className="pl-3 mb-1 font-mono" alignItems="center">
              <HStack alignItems="center" space={2}>
                <span>{events.length} messages</span>
                {activeConnection.elapsed === 0 && (
                  <Icon icon="refresh" size="sm" spin className="text-gray-600" />
                )}
              </HStack>
              <RecentConnectionsDropdown
                connections={connections}
                activeConnection={activeConnection}
                onPinned={() => {
                  // todo
                }}
              />
            </HStack>
            <div className="overflow-y-auto h-full">
              {...events.map((m) => (
                <MessageRow
                  key={m.id}
                  isActive={m.id === activeEventId}
                  eventType={m.eventType}
                  timestamp={m.createdAt}
                  onClick={() => {
                    if (m.id === activeEventId) setActiveEventId(null);
                    else setActiveEventId(m.id);
                  }}
                >
                  {m.content}
                </MessageRow>
              ))}
            </div>
          </div>
        )
      }
      secondSlot={
        activeEvent &&
        (() => (
          <div className="grid grid-rows-[auto_minmax(0,1fr)]">
            <div className="pb-3 px-2">
              <Separator />
            </div>
            <div className="pl-2 overflow-y-auto">
              {activeEvent.eventType === 'client_message' ||
              activeEvent.eventType === 'server_message' ? (
                <>
                  <div className="mb-2 select-text cursor-text font-semibold">
                    Message {activeEvent.eventType === 'client_message' ? 'Sent' : 'Received'}
                  </div>
                  <JsonAttributeTree attrValue={JSON.parse(activeEvent?.content ?? '{}')} />
                </>
              ) : (
                <div className="h-full grid grid-rows-[auto_minmax(0,1fr)]">
                  <div className="mb-2 select-text cursor-text font-semibold">
                    {activeEvent.content}
                  </div>
                  {Object.keys(activeEvent.metadata).length === 0 ? (
                    <EmptyStateText>
                      No {activeEvent.eventType === 'connection_response' ? 'trailers' : 'metadata'}
                    </EmptyStateText>
                  ) : (
                    <KeyValueRows>
                      {Object.entries(activeEvent.metadata).map(([key, value]) => (
                        <KeyValueRow key={key} label={key} value={value} />
                      ))}
                    </KeyValueRows>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      }
    />
  );
}

function MessageRow({
  onClick,
  isActive,
  eventType,
  children,
  timestamp,
}: {
  onClick?: () => void;
  isActive?: boolean;
  eventType: GrpcEvent['eventType'];
  children: ReactNode;
  timestamp: string;
}) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        'w-full grid grid-cols-[auto_minmax(0,3fr)_auto] gap-2 items-center text-left',
        'px-1 py-1 font-mono cursor-default group focus:outline-none',
        isActive && '!bg-highlight text-gray-900',
        'text-gray-800 hover:text-gray-900',
      )}
    >
      <Icon
        className={
          eventType === 'server_message'
            ? 'text-blue-600'
            : eventType === 'client_message'
            ? 'text-violet-600'
            : eventType === 'error'
            ? 'text-orange-600'
            : eventType === 'connection_response'
            ? 'text-green-600'
            : 'text-gray-700'
        }
        title={
          eventType === 'server_message'
            ? 'Server message'
            : eventType === 'client_message'
            ? 'Client message'
            : eventType === 'error'
            ? 'Error'
            : eventType === 'connection_response'
            ? 'Connection response'
            : undefined
        }
        icon={
          eventType === 'server_message'
            ? 'arrowBigDownDash'
            : eventType === 'client_message'
            ? 'arrowBigUpDash'
            : eventType === 'error'
            ? 'alert'
            : eventType === 'connection_response'
            ? 'check'
            : 'info'
        }
      />
      <div className={classNames('w-full truncate text-2xs')}>{children}</div>
      <div className={classNames('opacity-50 text-2xs')}>
        {format(timestamp + 'Z', 'HH:mm:ss.SSS')}
      </div>
    </button>
  );
}

const GRPC_CODES: Record<number, string> = {
  0: 'Ok',
  1: 'Cancelled',
  2: 'Unknown',
  3: 'Invalid argument',
  4: 'Deadline exceeded',
  5: 'Not found',
  6: 'Already exists',
  7: 'Permission denied',
  8: 'Resource exhausted',
  9: 'Failed precondition',
  10: 'Aborted',
  11: 'Out of range',
  12: 'Unimplemented',
  13: 'Internal',
  14: 'Unavailable',
  15: 'Data loss',
  16: 'Unauthenticated',
};
