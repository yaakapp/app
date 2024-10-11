import type { HttpResponse } from '@yaakapp-internal/models';
import classNames from 'classnames';
import type { EventSourceParser, ParsedEvent } from 'eventsource-parser';
import { createParser } from 'eventsource-parser';
import type { ReactNode } from 'react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useResponseBodyText } from '../../hooks/useResponseBodyText';
import { isJSON } from '../../lib/contentType';
import {tryFormatJson} from "../../lib/formatters";
import { Button } from '../core/Button';
import { Editor } from '../core/Editor';
import { Icon } from '../core/Icon';
import { InlineCode } from '../core/InlineCode';
import { Separator } from '../core/Separator';
import { SplitLayout } from '../core/SplitLayout';
import { HStack, VStack } from '../core/Stacks';

interface Props {
  response: HttpResponse;
}

interface WrappedParsedEvent {
  event: ParsedEvent;
  id: string;
}

export function EventStreamViewer({ response }: Props) {
  return (
    <Lazy // The initial parsing can be heavy, so lazily load the component
      key={response.id}
      render={() => <_EventStreamViewer response={response} />}
    />
  );
}

function _EventStreamViewer({ response }: Props) {
  const existingBody = useRef<string>('');
  const [showLarge, setShowLarge] = useState<boolean>(false);
  const [showingLarge, setShowingLarge] = useState<boolean>(false);
  const parser = useRef<EventSourceParser | null>(null);
  const [events, setEvents] = useState<WrappedParsedEvent[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const activeEvent = useMemo(
    () => events.find((e) => e.id === activeEventId),
    [activeEventId, events],
  );

  useEffect(() => {
    parser.current = createParser((event) => {
      if (event.type === 'reconnect-interval') return;
      const id = Math.random().toString();
      setEvents((events) => [...events, { event, id }]);
    });
  }, [response.id]);

  const rawTextBody = useResponseBodyText(response);
  useEffect(() => {
    const newText = rawTextBody.data?.slice(existingBody.current.length) ?? '';
    parser.current?.feed(newText);
    existingBody.current = rawTextBody.data ?? '';
  }, [rawTextBody.data]);

  const language = useMemo<'text' | 'json'>(() => {
    if (!activeEvent?.event?.data) return 'text';
    return isJSON(activeEvent?.event?.data) ? 'json' : 'text';
  }, [activeEvent?.event?.data]);

  return (
    <SplitLayout
      layout="vertical"
      name="grpc_events"
      defaultRatio={0.4}
      minHeightPx={20}
      firstSlot={() => (
        <EventStreamEventsVirtual
          events={events}
          activeEventId={activeEventId}
          setActiveEventId={setActiveEventId}
        />
      )}
      secondSlot={
        activeEvent && activeEvent.event.type === 'event'
          ? () => (
              <div className="grid grid-rows-[auto_minmax(0,1fr)]">
                <div className="pb-3 px-2">
                  <Separator />
                </div>
                <div className="pl-2 overflow-y-auto">
                  <div className="mb-2 select-text cursor-text font-semibold">Message Received</div>
                  {!showLarge && activeEvent.event.data.length > 1000 * 1000 ? (
                    <VStack space={2} className="italic text-text-subtlest">
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
                          color="secondary"
                          variant="border"
                          size="xs"
                        >
                          Try Showing
                        </Button>
                      </div>
                    </VStack>
                  ) : (
                    <Editor
                      readOnly
                      forceUpdateKey={activeEvent.event.data}
                      defaultValue={tryFormatJson(activeEvent.event.data)}
                      language={language}
                    />
                  )}
                </div>
              </div>
            )
          : null
      }
    />
  );
}

function EventStreamEventsVirtual({
  setActiveEventId,
  events,
  activeEventId,
}: {
  events: WrappedParsedEvent[];
  activeEventId: string | null;
  setActiveEventId: (eventId: string | null) => void;
}) {
  return (
    <div className="pb-3 grid">
      <Virtuoso
        totalCount={events.length}
        itemContent={(index: number) => {
          const event = events[index]!;
          return (
            <EventStreamEvent
              event={event}
              isActive={event.id === activeEventId}
              onClick={() => {
                if (event.id === activeEventId) setActiveEventId(null);
                else setActiveEventId(event.id);
              }}
            />
          );
        }}
      />
    </div>
  );
}

function EventStreamEvent({
  onClick,
  isActive,
  event,
  className,
}: {
  onClick: () => void;
  isActive: boolean;
  event: WrappedParsedEvent;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        className,
        'w-full grid grid-cols-[auto_auto_minmax(0,3fr)] gap-2 items-center text-left',
        'px-1.5 py-1 font-mono cursor-default group focus:outline-none rounded',
        isActive && '!bg-surface-highlight !text-text',
        'text-text-subtle hover:text',
      )}
    >
      <Icon className={classNames('text-info')} title="Server Message" icon="arrow_big_down_dash" />
      <HStack space={1.5} className="text-sm">
        {event.event.event && (
          <InlineCode className={classNames('py-0', isActive && 'bg-text-subtlest text-text')}>
            {event.event.event}
          </InlineCode>
        )}
        {event.event.id && (
          <InlineCode className={classNames('py-0', isActive && 'bg-text-subtlest text-text')}>
            {event.event.id}
          </InlineCode>
        )}
      </HStack>
      <div className={classNames('w-full truncate text-xs')}>{event.event.data.slice(0, 1000)}</div>
    </button>
  );
}

function Lazy({ render }: { render: () => ReactNode }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(true);
  }, []);

  if (!visible) return false;

  return <>{render()}</>;
}
