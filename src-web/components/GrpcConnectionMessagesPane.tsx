import classNames from 'classnames';
import { format } from 'date-fns';
import type { CSSProperties } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import { useGrpcConnections } from '../hooks/useGrpcConnections';
import { useGrpcEvents } from '../hooks/useGrpcEvents';
import { useStateWithDeps } from '../hooks/useStateWithDeps';
import type { GrpcEvent, GrpcRequest } from '../lib/models';
import { Button } from './core/Button';
import { Icon } from './core/Icon';
import { JsonAttributeTree } from './core/JsonAttributeTree';
import { KeyValueRow, KeyValueRows } from './core/KeyValueRow';
import { Separator } from './core/Separator';
import { SplitLayout } from './core/SplitLayout';
import { HStack, VStack } from './core/Stacks';
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

export function GrpcConnectionMessagesPane({ style, methodType, activeRequest }: Props) {
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const connections = useGrpcConnections(activeRequest.id ?? null);
  const activeConnection = connections[0] ?? null;
  const events = useGrpcEvents(activeConnection?.id ?? null);
  const [showLarge, setShowLarge] = useStateWithDeps<boolean>(false, [activeRequest.id]);
  const [showingLarge, setShowingLarge] = useState<boolean>(false);

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
                  <Icon icon="refresh" size="sm" spin className="text-fg-subtler" />
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
              {...events.map((e) => (
                <EventRow
                  key={e.id}
                  event={e}
                  isActive={e.id === activeEventId}
                  onClick={() => {
                    if (e.id === activeEventId) setActiveEventId(null);
                    else setActiveEventId(e.id);
                  }}
                />
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
                  {!showLarge && activeEvent.content.length > 1000 * 1000 ? (
                    <VStack space={2} className="text-sm italic text-fg-subtler">
                      Message previews larger than 1MB are hidden
                      <div>
                        <Button
                          onClick={() => {
                            setShowingLarge(true);
                            setTimeout(() => {
                              setShowLarge(true);
                              setShowingLarge(false);
                            }, 500);
                          }}
                          isLoading={showingLarge}
                          color="gray"
                          variant="border"
                          size="xs"
                        >
                          Try Showing
                        </Button>
                      </div>
                    </VStack>
                  ) : (
                    <JsonAttributeTree attrValue={JSON.parse(activeEvent?.content ?? '{}')} />
                  )}
                </>
              ) : (
                <div className="h-full grid grid-rows-[auto_minmax(0,1fr)]">
                  <div>
                    <div className="select-text cursor-text font-semibold">
                      {activeEvent.content}
                    </div>
                    {activeEvent.error && (
                      <div className="select-text cursor-text text-xs font-mono py-1 text-orange-700">
                        {activeEvent.error}
                      </div>
                    )}
                  </div>
                  <div className="py-2 h-full">
                    {Object.keys(activeEvent.metadata).length === 0 ? (
                      <EmptyStateText>
                        No {activeEvent.eventType === 'connection_end' ? 'trailers' : 'metadata'}
                      </EmptyStateText>
                    ) : (
                      <KeyValueRows>
                        {Object.entries(activeEvent.metadata).map(([key, value]) => (
                          <KeyValueRow key={key} label={key} value={value} />
                        ))}
                      </KeyValueRows>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))
      }
    />
  );
}

function EventRow({
  onClick,
  isActive,
  event,
}: {
  onClick?: () => void;
  isActive?: boolean;
  event: GrpcEvent;
}) {
  const { eventType, status, createdAt, content, error } = event;
  return (
    <div className="px-1">
      <button
        onClick={onClick}
        className={classNames(
          'w-full grid grid-cols-[auto_minmax(0,3fr)_auto] gap-2 items-center text-left',
          'px-1.5 py-1 font-mono cursor-default group focus:outline-none rounded',
          isActive && '!bg-background-highlight-secondary text-fg',
          'text-fg-subtle hover:text-fg',
        )}
      >
        <Icon
          className={
            eventType === 'server_message'
              ? 'text-blue-600'
              : eventType === 'client_message'
              ? 'text-violet-600'
              : eventType === 'error' || (status != null && status > 0)
              ? 'text-orange-600'
              : eventType === 'connection_end'
              ? 'text-green-600'
              : 'text-fg-subtle'
          }
          title={
            eventType === 'server_message'
              ? 'Server message'
              : eventType === 'client_message'
              ? 'Client message'
              : eventType === 'error' || (status != null && status > 0)
              ? 'Error'
              : eventType === 'connection_end'
              ? 'Connection response'
              : undefined
          }
          icon={
            eventType === 'server_message'
              ? 'arrowBigDownDash'
              : eventType === 'client_message'
              ? 'arrowBigUpDash'
              : eventType === 'error' || (status != null && status > 0)
              ? 'alert'
              : eventType === 'connection_end'
              ? 'check'
              : 'info'
          }
        />
        <div className={classNames('w-full truncate text-2xs')}>
          {content.slice(0, 1000)}
          {error && <span className="text-orange-600"> ({error})</span>}
        </div>
        <div className={classNames('opacity-50 text-2xs')}>
          {format(createdAt + 'Z', 'HH:mm:ss.SSS')}
        </div>
      </button>
    </div>
  );
}
