import classnames from 'classnames';
import type { MouseEvent as ReactMouseEvent } from 'react';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useActiveRequest } from '../hooks/useActiveRequest';
import { useCreateRequest } from '../hooks/useCreateRequest';
import { useDeleteRequest } from '../hooks/useDeleteRequest';
import { useKeyValue } from '../hooks/useKeyValue';
import { useRequests } from '../hooks/useRequests';
import { useUpdateRequest } from '../hooks/useUpdateRequest';
import { clamp } from '../lib/clamp';
import type { HttpRequest } from '../lib/models';
import { Button } from './core/Button';
import { Dropdown, DropdownMenuTrigger } from './core/Dropdown';
import { Icon } from './core/Icon';
import { IconButton } from './core/IconButton';
import { HStack, VStack } from './core/Stacks';
import { WindowDragRegion } from './core/WindowDragRegion';
import { ToggleThemeButton } from './ToggleThemeButton';

interface Props {
  className?: string;
}

const MIN_WIDTH = 110;
const INITIAL_WIDTH = 200;
const MAX_WIDTH = 500;

enum ItemTypes {
  REQUEST = 'request',
}

export function Sidebar({ className }: Props) {
  return (
    <DndProvider backend={HTML5Backend}>
      <Container className={className} />
    </DndProvider>
  );
}

export function Container({ className }: Props) {
  const [isResizing, setIsRisizing] = useState<boolean>(false);
  const width = useKeyValue<number>({ key: 'sidebar_width', initialValue: INITIAL_WIDTH });
  const sidebarRef = useRef<HTMLDivElement>(null);
  const requests = useRequests();
  const activeRequest = useActiveRequest();
  const createRequest = useCreateRequest({ navigateAfter: true });

  const moveState = useRef<{ move: (e: MouseEvent) => void; up: () => void } | null>(null);
  const unsub = () => {
    if (moveState.current !== null) {
      document.documentElement.removeEventListener('mousemove', moveState.current.move);
      document.documentElement.removeEventListener('mouseup', moveState.current.up);
    }
  };

  const handleResizeReset = useCallback(() => {
    width.set(INITIAL_WIDTH);
  }, []);

  const handleResizeStart = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    unsub();
    const mouseStartX = e.clientX;
    const startWidth = width.value;
    moveState.current = {
      move: (e: MouseEvent) => {
        const newWidth = clamp(startWidth + (e.clientX - mouseStartX), MIN_WIDTH, MAX_WIDTH);
        width.set(newWidth);
      },
      up: () => {
        unsub();
        setIsRisizing(false);
      },
    };
    document.documentElement.addEventListener('mousemove', moveState.current.move);
    document.documentElement.addEventListener('mouseup', moveState.current.up);
    setIsRisizing(true);
  }, []);

  const sidebarStyles = useMemo(() => ({ width: width.value }), [width.value]);
  const sidebarWidth = width.value - 1; // Minus 1 for the border

  return (
    <div
      ref={sidebarRef}
      style={sidebarStyles}
      className={classnames(
        className,
        'relative',
        'bg-gray-100 h-full border-r border-gray-200 relative grid grid-rows-[auto,1fr,auto]',
      )}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        aria-hidden
        className="group absolute -right-2 top-0 bottom-0 w-4 cursor-ew-resize flex justify-center"
        onMouseDown={handleResizeStart}
        onDoubleClick={handleResizeReset}
      >
        <div // drag-divider
          className={classnames(
            'transition-colors w-[1px] group-hover:bg-gray-300 h-full pointer-events-none',
            isResizing && '!bg-blue-500/70',
          )}
        />
      </div>
      <HStack as={WindowDragRegion} alignItems="center" justifyContent="end">
        <IconButton
          title="Add Request"
          className="mx-1"
          icon="plusCircle"
          onClick={async () => {
            await createRequest.mutate({ name: 'Test Request' });
          }}
        />
      </HStack>
      <VStack as="ul" className="py-3 overflow-auto h-full" space={1}>
        <SidebarItems
          sidebarWidth={sidebarWidth}
          activeRequestId={activeRequest?.id}
          requests={requests}
        />
      </VStack>
      <HStack className="mx-1 pb-1" alignItems="center" justifyContent="end">
        <ToggleThemeButton />
      </HStack>
    </div>
  );
}

function SidebarItems({
  requests,
  activeRequestId,
  sidebarWidth,
}: {
  requests: HttpRequest[];
  activeRequestId?: string;
  sidebarWidth: number;
}) {
  const [items, setItems] = useState(requests.map((r) => ({ request: r, left: 0, top: 0 })));

  useEffect(() => {
    setItems(requests.map((r) => ({ request: r, left: 0, top: 0 })));
  }, [requests]);

  const handleMove = useCallback((id: string, hoverId: string) => {
    setItems((oldItems) => {
      const dragIndex = oldItems.findIndex((i) => i.request.id === id);
      const index = oldItems.findIndex((i) => i.request.id === hoverId);
      const newItems = [...oldItems];
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const b = newItems[index]!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      newItems[index] = newItems[dragIndex]!;
      newItems[dragIndex] = b;
      return newItems;
    });
  }, []);

  return (
    <>
      {items.map(({ request }) => (
        <DraggableSidebarItem
          key={request.id}
          requestId={request.id}
          requestName={request.name}
          workspaceId={request.workspaceId}
          active={request.id === activeRequestId}
          sidebarWidth={sidebarWidth}
          onMove={handleMove}
        />
      ))}
    </>
  );
}

type SidebarItemProps = {
  requestId: string;
  requestName: string;
  workspaceId: string;
  sidebarWidth: number;
  active?: boolean;
};

const SidebarItem = memo(function SidebarItem({
  requestName,
  requestId,
  workspaceId,
  active,
  sidebarWidth,
}: SidebarItemProps) {
  const deleteRequest = useDeleteRequest(requestId);
  const updateRequest = useUpdateRequest(requestId);
  const [editing, setEditing] = useState<boolean>(false);

  const handleSubmitNameEdit = useCallback(async (el: HTMLInputElement) => {
    await updateRequest.mutate({ name: el.value });
    setEditing(false);
  }, []);

  const handleFocus = useCallback((el: HTMLInputElement | null) => {
    el?.focus();
    el?.select();
  }, []);

  const itemStyles = useMemo(() => ({ width: sidebarWidth }), [sidebarWidth]);

  if (workspaceId === null) return null;

  return (
    <li className={classnames('block group/item px-2')} style={itemStyles}>
      <div className="relative w-full">
        <Button
          color="custom"
          size="sm"
          draggable={false} // Item should drag, not the link
          className={classnames(
            'w-full',
            editing && 'focus-within:border-blue-400/40',
            active
              ? 'bg-gray-200/70 text-gray-900'
              : 'text-gray-600 group-hover/item:text-gray-800 active:bg-gray-200/30',
            // Move out of the way when trash is shown
            'group-hover/item:pr-7',
          )}
          onKeyDown={(e) => {
            // Hitting enter on active request during keyboard nav will start edit
            if (active && e.key === 'Enter') {
              e.preventDefault();
              setEditing(true);
            }
          }}
          to={`/workspaces/${workspaceId}/requests/${requestId}`}
          onDoubleClick={() => setEditing(true)}
          onClick={active ? () => setEditing(true) : undefined}
          justify="start"
        >
          {editing ? (
            <input
              ref={handleFocus}
              defaultValue={requestName}
              className="bg-transparent outline-none w-full"
              onBlur={(e) => handleSubmitNameEdit(e.currentTarget)}
              onKeyDown={async (e) => {
                switch (e.key) {
                  case 'Enter':
                    await handleSubmitNameEdit(e.currentTarget);
                    break;
                  case 'Escape':
                    setEditing(false);
                    break;
                }
              }}
            />
          ) : (
            <span className={classnames('truncate', !requestName && 'text-gray-400 italic')}>
              {requestName || 'New Request'}
            </span>
          )}
        </Button>
        <Dropdown
          items={useMemo(
            () => [
              {
                label: 'Delete Request',
                onSelect: deleteRequest.mutate,
                leftSlot: <Icon icon="trash" />,
              },
            ],
            [],
          )}
        >
          <DropdownMenuTrigger
            className={classnames(
              'absolute right-0 top-0 transition-opacity opacity-0',
              'group-hover/item:opacity-100 focus-visible:opacity-100',
            )}
          >
            <IconButton
              color="custom"
              size="sm"
              iconSize="sm"
              title="Delete request"
              icon="dotsH"
            />
          </DropdownMenuTrigger>
        </Dropdown>
      </div>
    </li>
  );
});

type DraggableSidebarItemProps = SidebarItemProps & {
  onMove: (id: string, hoverId: string) => void;
};

type DragItem = {
  id: string;
};

const DraggableSidebarItem = memo(function DraggableSidebarItem({
  requestName,
  requestId,
  workspaceId,
  active,
  sidebarWidth,
  onMove,
}: DraggableSidebarItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [, connectDrop] = useDrop<DragItem, void>({
    accept: ItemTypes.REQUEST,
    collect: (m) => ({ handlerId: m.getHandlerId(), isOver: m.isOver() }),
    hover: (item) => {
      if (item.id !== requestId) {
        onMove(requestId, item.id);
      }
    },
  });

  const [{ isDragging }, connectDrag] = useDrag<DragItem, unknown, { isDragging: boolean }>(() => ({
    type: ItemTypes.REQUEST,
    item: () => ({ id: requestId }),
    collect: (m) => ({ isDragging: m.isDragging() }),
  }));

  connectDrag(ref);
  connectDrop(ref);

  return (
    <div ref={ref} className={classnames(isDragging && 'opacity-0')}>
      <SidebarItem
        requestName={requestName}
        requestId={requestId}
        workspaceId={workspaceId}
        active={active}
        sidebarWidth={sidebarWidth}
      />
    </div>
  );
});
